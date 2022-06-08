const { name_singular_sentences, nameless_singular_sentences, name_plural_sentences, nameless_plural_sentences, no_pronouns } = require('./sentences.json');

exports.make_sentences = function(subjective, objective, possessive, second_possessive, reflexive, name, plural) {
    var sentences;
	if (reflexive !== null) {
		if (name !== null) {
			if (plural) {
				sentences = name_plural_sentences;
			} else {
				sentences = name_singular_sentences;
			}
		} else {
			if (plural) {
				sentences = nameless_plural_sentences;
			} else {
				sentences = nameless_singular_sentences;
			}
		}
	} else {
		sentences = no_pronouns;
	}
    name ??= "";
	subjective ??= "";
	objective ??= "";
	possessive ??= "";
	second_possessive ??= "";
	reflexive ??= "";
	let indexes_used = [];
	let response = "Okay, how do these look?";
	while (true) {
		let index = Math.floor(Math.random() * sentences.length);
		if (indexes_used.includes(index)) {
			continue;
		}
		indexes_used.push(index);
		let sentence = sentences[index]
			.replaceAll("[subjective]", subjective.toLowerCase())
			.replaceAll("[objective]", objective.toLowerCase())
			.replaceAll("[possessive]", possessive.toLowerCase())
			.replaceAll("[possessive2]", second_possessive.toLowerCase())
			.replaceAll("[reflexive]", reflexive.toLowerCase())
			.replaceAll("[name]", name)

			.replaceAll("[^subjective]", subjective[0].toUpperCase() + subjective.substring(1).toLowerCase())
			.replaceAll("[^objective]", objective[0].toUpperCase() + objective.substring(1).toLowerCase())
			.replaceAll("[^possessive]", possessive[0].toUpperCase() + possessive.substring(1).toLowerCase())
			.replaceAll("[^possessive2]", second_possessive[0].toUpperCase() + second_possessive.substring(1).toLowerCase())
			.replaceAll("[^reflexive]", reflexive[0].toUpperCase() + reflexive.substring(1).toLowerCase())
			.replaceAll("[^name]", name)
			
			.replaceAll("[^subjective^]", subjective.toUpperCase())
			.replaceAll("[^objective^]", objective.toUpperCase())
			.replaceAll("[^possessive^]", possessive.toUpperCase())
			.replaceAll("[^possessive2^]", second_possessive.toUpperCase())
			.replaceAll("[^reflexive^]", reflexive.toUpperCase())
			.replaceAll("[^name^]", name.toUpperCase());
		response += "\n\n**Sentence " + indexes_used.length.toString() + ":**\n" + sentence;
		if (indexes_used.length == 3) {
			break;
		}
	}
    return response;
}