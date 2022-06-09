const { name_singular_sentences, nameless_singular_sentences, name_plural_sentences, nameless_plural_sentences, no_pronouns } = require('./sentences.json');
const pronouns = require('./pronouns.json');

const SENTENCE_NUMBER = 3;

exports.make_sentences = function(subjective, objective, possessive, second_possessive, reflexive, name, plural) {
    var sentences;
	if (subjective !== null) {
		if (name !== null) {
			if (plural) {
				sentences = [...name_plural_sentences];
			} else {
				sentences = [...name_singular_sentences];
			}
		} else {
			if (plural) {
				sentences = [...nameless_plural_sentences];
			} else {
				sentences = [...nameless_singular_sentences];
			}
		}
	} else {
		sentences = no_pronouns;
	}
    name ??= "";
	let response = "Okay, how do these look?";
	for (let i = 0; i < SENTENCE_NUMBER; i++) {
		let index = Math.floor(Math.random() * sentences.length);
		let sentence = sentences.splice(index, 1)[0]
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

exports.make_all_pronouns = function(name, use_plural) {
	var sets;
	if (use_plural) {
		sets = [...pronouns];
	} else {
		sets = pronouns.filter(set => {
			return !set[5]
		});
	}
	let subjectives = [];
	let objectives = [];
	let possessives = [];
	let second_possessives = [];
	let reflexives = [];

	for (let i = 0; i < sets.length; i++) {
		let set = sets[i];
		subjectives.push(set[0]);
		objectives.push(set[1]);
		possessives.push(set[2]);
		second_possessives.push(set[3]);
		reflexives.push(set[4]);
	}

	var sentences;
	if (name !== null) {
		sentences = [...name_singular_sentences];
	} else {
		sentences = [...nameless_singular_sentences];
	}

	name ??= "";
	let response = "Okay, how do these look?";
	for (let i = 0; i < SENTENCE_NUMBER; i++) {
		let index = Math.floor(Math.random() * sentences.length);
		let sentence = sentences.splice(index, 1)[0]
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
	return response
}