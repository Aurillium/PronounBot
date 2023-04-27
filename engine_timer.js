"use_strict";

import config from "./config.json" assert { type: "json" };

import { performance } from 'perf_hooks';
import { createPool } from 'mysql';
import { promisify } from 'util';
import { generate_sentences, expand_set } from './engine.js';

// Foreword:
// This script is scuffed, not well tested at all
// Sentences 1-1 is broken but I'm not sure why
// The script serves its purpose without this for
// now though. It will be updated when I come closer
// to swapping out the engine.

// It actually gets faster the more you run it
// Ideally to benchmark well you find a sweet spot between
// being able to build averages and the speed being skewed
// by repetition

const SET_REPS = 1;
const SENTENCE_REPS = 1;

let db;
if (config.database.socket !== undefined) {
	db = createPool({
		user: config.database.username,
		password: config.database.password,
		database: config.database.database,
		socketPath: config.database.socket
	});
} else {
	db = createPool({
		port: config.database.port,
		host: config.database.address,
		user: config.database.username,
		password: config.database.password,
		database: config.database.database
	});
}
const query = promisify(db.query).bind(db);
db.async_query = query;

let all_names = ["Robert", "Memphis", "Iloh", "Shae", "Stolas", "Ivy", "Calvin", "Rocky"];
let raw_sets = ["she", "he", "it", "he/him", "they/them", "she/her", "he/him/his", "they/them/their", "xe/xem/xeir/xemself", "zae/zem/zeir/zemself", "fae/faem/faer/faers/faemself", "ey/eym/eyr/eyrs/eyrself"];

let set_times = {};
let sentence_average = 0;

for (const raw_set of raw_sets) {
    set_times[raw_set] = 0;
}

let sets = [];

for (let i = 0; i < SET_REPS; i++) {
    for (const raw_set of raw_sets) {
        let start = performance.now();
        let set = expand_set(raw_set);
        let end = performance.now();

        if (i === 0) {
            sets.push(set);
        }
        set_times[raw_set] += (end - start) / SET_REPS;
    }
}

console.log("Set times:");
console.log(set_times);

let sentence_times = {};

let name_combos = [];
for (let i = 0; i < all_names.length - 1; i++) {
    name_combos.push(all_names.slice(0, i + 1));
}
let set_combos = [];
for (let i = 0; i < sets.length - 1; i++) {
    set_combos.push(sets.slice(0, i + 1));
    for (let j = 0; j < all_names.length - 1; j++) {
        sentence_times[(j + 1).toString() + "-" + (i + 1).toString()] = 0;
    }
}



(async () => {
    for (let i = 0; i < SENTENCE_REPS; i++) {
        for (const names of name_combos) {
            for (const sets of set_combos) {
                let start = performance.now();
                let sentence = await generate_sentences(sets, names, db);
                let end = performance.now();
                
                sentence_times[names.length.toString() + "-" + sets.length.toString()] += (end - start) / SENTENCE_REPS;
            }
        }
    }

    console.log("Sentence times:");
    console.log(sentence_times);

    process.exit();
})();