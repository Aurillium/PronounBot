"use strict";

const SENTENCE_NUMBER = 3;

function second_possessive(possessive) {
	const last_letter = possessive[possessive.length - 1];
	let possessive2;
	if (last_letter === "s" || last_letter === "z") {
		possessive2 = possessive;
	} else {
		possessive2 = possessive + "s";
	}
	return possessive2;
}

// Last index is plural
const he_him = ["he", "him", "his", "his", "himself", false];
const she_her = ["she", "her", "her", "hers", "herself", false];
const they_them = ["they", "them", "their", "theirs", "themself", true];
const it_its = ["it", "it", "its", "its", "itself", false];

exports.expand_set = function(raw_set) {
	let colon_index = raw_set.lastIndexOf(":");
	let plural_str = "";
	let plural = null;
	if (colon_index !== -1) {
		plural_str = raw_set.substring(colon_index + 1);
		if (plural_str === "p" || plural_str === "pl" || plural_str === "plural") {
			plural = true;
		} else if (plural_str === "s" || plural_str === "singular") {
			plural = false;
		}
		raw_set = raw_set.substring(0, colon_index);
	}
	let list_set = raw_set.split("/");
	if (list_set.length === 1) {
		if (list_set[0] === "he") {
			return he_him;
		} else if (list_set[0] === "she") {
			return she_her;
		} else if (list_set[0] === "they") {
			return they_them;
		} else if (list_set[0] === "it") {
			return it_its;
		} else {
			return null;
		}
	} else if (list_set.length === 2) {
		if (list_set[0] === "he" && list_set[1] === "him") {
			return he_him;
		} else if (list_set[0] === "she" && list_set[1] === "her") {
			return she_her;
		} else if (list_set[0] === "they" && list_set[1] === "them") {
			return they_them;
		} else if (list_set[0] === "it" && (list_set[1] === "it" || list_set[1] === "its")) {
			return it_its;
		} else {
			return null;
		}
	} else if (list_set.length === 3) {
		const possessive = list_set[2];
		const possessive2 = second_possessive(possessive);
		return [list_set[0], list_set[1], possessive, possessive2, list_set[1] + "self", plural]
	} else if (list_set.length === 4) {
		const possessive = list_set[2];
		const possessive2 = second_possessive(possessive);
		return [list_set[0], list_set[1], possessive, possessive2, list_set[3], plural];
	} else if (list_set.length === 5) {
		return [list_set[0], list_set[1], list_set[2], list_set[3], list_set[4], plural];
	} else {
		return null;
	}
}

exports.make_sentences = function(subjective, objective, possessive, second_possessive, reflexive, name, plural, db, response="Okay, how do these look?") {
	let type;
	if (subjective !== null) {
		if (name !== null) {
			if (plural) {
				type = 2;
			} else {
				type = 0;
			}
		} else {
			if (plural) {
				type = 3;
			} else {
				type = 1;
			}
		}
	} else {
		type = 4;
	}
	let sentences = db.prepare("SELECT Sentence FROM Sentences WHERE Type=?").all(type);

    name ??= "";
	for (let i = 0; i < SENTENCE_NUMBER; i++) {
		let index = Math.floor(Math.random() * sentences.length);
		let sentence = sentences.splice(index, 1)[0].Sentence
			.replaceAll("[name]", name)
			.replaceAll("[^name]", name)
			.replaceAll("[^name^]", name.toUpperCase());
		if (subjective !== null) {
			sentence = sentence
				.replaceAll("[subjective]", subjective.toLowerCase())
				.replaceAll("[objective]", objective.toLowerCase())
				.replaceAll("[possessive]", possessive.toLowerCase())
				.replaceAll("[possessive2]", second_possessive.toLowerCase())
				.replaceAll("[reflexive]", reflexive.toLowerCase())

				.replaceAll("[^subjective]", subjective[0].toUpperCase() + subjective.substring(1).toLowerCase())
				.replaceAll("[^objective]", objective[0].toUpperCase() + objective.substring(1).toLowerCase())
				.replaceAll("[^possessive]", possessive[0].toUpperCase() + possessive.substring(1).toLowerCase())
				.replaceAll("[^possessive2]", second_possessive[0].toUpperCase() + second_possessive.substring(1).toLowerCase())
				.replaceAll("[^reflexive]", reflexive[0].toUpperCase() + reflexive.substring(1).toLowerCase())

				.replaceAll("[^subjective^]", subjective.toUpperCase())
				.replaceAll("[^objective^]", objective.toUpperCase())
				.replaceAll("[^possessive^]", possessive.toUpperCase())
				.replaceAll("[^possessive2^]", second_possessive.toUpperCase())
				.replaceAll("[^reflexive^]", reflexive.toUpperCase());
		}
		response += "\n\n**Sentence " + (i + 1).toString() + ":**\n" + sentence;
	}
	return response;
}

function random_replace(text, old, new_list, processing, replacement=true) {
	let new_list_copy = [...new_list];
	while (text.includes(old)) {
		let index = Math.floor(Math.random() * new_list_copy.length);
		let chosen = new_list_copy[index];
		if (!replacement) {
			new_list_copy.splice(index, 1);
		}
		text = text.replace(old, processing(chosen));
	}
	return text;
}

exports.make_all_pronouns = function(name, use_plural, db) {
	let subjectives = [];
	let objectives = [];
	let possessives = [];
	let second_possessives = [];
	let reflexives = [];
	let statement;
	if (use_plural) {
		statement = db.prepare("SELECT Subjective, Objective, Possessive, Possessive2, Reflexive FROM Sets");
	} else {
		statement = db.prepare("SELECT Subjective, Objective, Possessive, Possessive2, Reflexive FROM Sets WHERE Plural=0");
	}
	for (const set of statement.iterate()) {
		subjectives.push(set.Subjective);
		objectives.push(set.Objective);
		possessives.push(set.Possessive);
		second_possessives.push(set.Possessive2);
		reflexives.push(set.Reflexive);
	}

	let type;
	if (name !== null) {
		type = 0;
	} else {
		type = 1;
	}
	let sentences = db.prepare("SELECT Sentence FROM Sentences WHERE Type=?").all(type);

	name ??= "";
	let response = "Okay, how do these look?";
	for (let i = 0; i < SENTENCE_NUMBER; i++) {
		let index = Math.floor(Math.random() * sentences.length);
		let sentence = sentences.splice(index, 1)[0].Sentence
			.replaceAll("[name]", name)
			.replaceAll("[^name]", name)
			.replaceAll("[^name^]", name.toUpperCase());
		sentence = random_replace(sentence, "[subjective]", subjectives, text => text.toLowerCase());
		sentence = random_replace(sentence, "[objective]", objectives, text => text.toLowerCase());
		sentence = random_replace(sentence, "[possessive]", possessives, text => text.toLowerCase());
		sentence = random_replace(sentence, "[possessive2]", second_possessives, text => text.toLowerCase());
		sentence = random_replace(sentence, "[reflexive]", reflexives, text => text.toLowerCase());

		sentence = random_replace(sentence, "[^subjective]", subjectives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^objective]", objectives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^possessive]", possessives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^possessive2]", second_possessives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^reflexive]", reflexives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());

		sentence = random_replace(sentence, "[^subjective^]", subjectives, text => text.toUpperCase());
		sentence = random_replace(sentence, "[^objective^]", objectives, text => text.toUpperCase());
		sentence = random_replace(sentence, "[^possessive^]", possessives, text => text.toUpperCase());
		sentence = random_replace(sentence, "[^possessive2^]", second_possessives, text => text.toUpperCase());
		sentence = random_replace(sentence, "[^reflexive^]", reflexives, text => text.toUpperCase());
		response += "\n\n**Sentence " + (i + 1).toString() + ":**\n" + sentence;
	}
	return response;
}

exports.make_one_command_sentences = function(sets, names, plural, db, response) {
	if (sets.length === 0 && names.length === 0) {
		return "Can't make sentences with no names or pronouns :(";
	}
	
	let subjectives = [];
	let objectives = [];
	let possessives = [];
	let second_possessives = [];
	let reflexives = [];

	for (const set of sets) {
		subjectives.push(set[0]);
		objectives.push(set[1]);
		possessives.push(set[2]);
		second_possessives.push(set[3]);
		reflexives.push(set[4]);
	}
	
	let type = null;
	if (subjectives.length !== 0) {
		if (names.length !== 0) {
			if (plural) {
				type = 2;
			} else {
				type = 0;
			}
		} else {
			if (plural) {
				type = 3;
			} else {
				type = 1;
			}
		}
	} else {
		type = 4;
	}
	let sentences = db.prepare("SELECT Sentence FROM Sentences WHERE Type=?").all(type);

	for (let i = 0; i < SENTENCE_NUMBER; i++) {
		let index = Math.floor(Math.random() * sentences.length);
		let sentence = sentences.splice(index, 1)[0].Sentence;
		
		sentence = random_replace(sentence, "[name]", names, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^name]", names, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^name^]", names, text => text.toUpperCase());
		
		sentence = random_replace(sentence, "[subjective]", subjectives, text => text.toLowerCase());
		sentence = random_replace(sentence, "[objective]", objectives, text => text.toLowerCase());
		sentence = random_replace(sentence, "[possessive]", possessives, text => text.toLowerCase());
		sentence = random_replace(sentence, "[possessive2]", second_possessives, text => text.toLowerCase());
		sentence = random_replace(sentence, "[reflexive]", reflexives, text => text.toLowerCase());

		sentence = random_replace(sentence, "[^subjective]", subjectives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^objective]", objectives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^possessive]", possessives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^possessive2]", second_possessives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());
		sentence = random_replace(sentence, "[^reflexive]", reflexives, text => text[0].toUpperCase() + text.substring(1).toLowerCase());

		sentence = random_replace(sentence, "[^subjective^]", subjectives, text => text.toUpperCase());
		sentence = random_replace(sentence, "[^objective^]", objectives, text => text.toUpperCase());
		sentence = random_replace(sentence, "[^possessive^]", possessives, text => text.toUpperCase());
		sentence = random_replace(sentence, "[^possessive2^]", second_possessives, text => text.toUpperCase());
		sentence = random_replace(sentence, "[^reflexive^]", reflexives, text => text.toUpperCase());
		response += "\n\n**Sentence " + (i + 1).toString() + ":**\n" + sentence;
	}
	return response;
}

//const piece = new RegExp("[^\u200B]\[(.*?)\]");

// Zero-width space is the escape character to prevent matches on user input
// All instances of it get removed at the end but it's invisible so no one will
// notice it's gone if they added one to their input anyway
const piece = /(?:{(.*?)\|(.*?)}( ?))?\[([^\u200B].*?)\](?:( ?\S*){(.*?)\|(.*?)})?/;
// Returns: [whole, singular, plural, gap, pronoun, gap, singular, plural] because even I won't be able to understand this in two days

function new_parser(text, names, sets) {
	let result;
	while ((result = piece.exec(text)) !== null) {
		let central = result[4];
		let capitals = 0; // None
		let form_before = "";
		let form_after = "";
		if (central[0] === "^") {
			capitals = 1; // First letter
			central = central.substring(1);
		}
		if (central[central.length - 1] === "^") {
			capitals = 2; // All
			central = central.substring(0, central.length - 1);
		}

		if (central === "name") {
			// It's a name!
			central = names[Math.floor(Math.random() * names.length)];
			if (capitals === 0) {
				capitals = 1; // Capitalise names
			}
		} else {
			// It's a pronoun!
			let set = sets[Math.floor(Math.random() * sets.length)];

			// Work out the pronoun type and apply the correct one
			if (central === "subjective") {
				central = set[0];
			} else if (central === "objective") {
				central = set[1];
			} else if (central === "possessive") {
				central = set[2];
			} else if (central === "possessive2") {
				central = set[3];
			} else if (central === "reflexive") {
				central = set[4];
			}

			if (set[5] === true) {
				// Plural set
				form_before = result[2];
				form_after = result[7];
			} else {
				// Singular set
				form_before = result[1];
				form_after = result[6];
			}
		}

		// Apply capitalisation
		if (capitals === 1) {
			central = central[0].toUpperCase() + central.substring(1).toLowerCase();
		} else if (capitals === 2) {
			central = central.toUpperCase();
		}

		// Construct the final parsed section
		let final = "";
		if (result[1] !== undefined) {
			final += form_before + result[3];
		}
		final += central.replaceAll("[", "[\u200B"); // Escape any potential matches in user input
		if (result[6] !== undefined) {
			final += result[5] + form_after;
		}
		// Substitute it in
		text = text.replace(result[0], final);
	}
	// Remove all zero-width spaces (escape codes)
	text.replaceAll("\u200B", "");
	return text;
}


//let platypus = "Curse you Perry the platypus! What? What do you mean [possessive] name isn't Perry? It's [name]? Well why {isn't|aren't} [subjective] telling me this [reflexive]? [^possessive] friend needed to talk to [objective]? Alright, I can understand that. Curse you [name] the platypus!";
console.log(new_parser(platypus, ["Memphis", "M"], [["he", "him", "his", "his", "himself", false], ["they", "them", "their", "theirs", "themself", true]]));