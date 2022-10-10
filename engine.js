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

exports.generate_sentences = async function(sets, names, db, before="Okay, how do these look?", after="") {
	if (sets.length === 0 && names.length === 0) {
		// I think this is pretty self-explanatory
		return "Can't make sentences with no names or pronouns :(";
	}

	// The before text goes *before* the sentences ^-^
	let response = before;
	
	let type = null;
	if (sets.length !== 0) {
		if (names.length !== 0) {
			type = 0; // Names, pronouns
		} else {
			type = 1; // No names, pronouns
		}
	} else {
		type = 2; // Names, no pronouns
	}
	// *Grabby hands* gimme
	let sentences = await db.async_query("SELECT Sentence FROM Sentences WHERE Type=?", type);

	// Add them all to the message and then process
	for (let i = 0; i < SENTENCE_NUMBER; i++) {
		let index = Math.floor(Math.random() * sentences.length);
		let sentence = sentences.splice(index, 1)[0].Sentence;
		response += "\n\n**Sentence " + (i + 1).toString() + ":**\n" + sentence;
	}
	// Don't exlude the after text from processing!
	response += after;

	response = genderify_text(response, sets, names);

	return response;
}

//const piece = new RegExp("[^\u200B]\[(.*?)\]");

// Zero-width space is the escape character to prevent matches on user input
// All instances of it get removed at the end but it's invisible so no one will
// notice it's gone if they added one to their input anyway
const piece = /(?:{(.*?)\|(.*?)}( ?))?\[([^\u200B].*?)\](?:( ?\S* ?){(.*?)\|(.*?)})?/;
// Returns: [whole, singular, plural, gap, pronoun, gap, singular, plural] because even I won't be able to understand this in two days

function genderify_text(text, sets, names) {
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

			if (set[5]) {
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