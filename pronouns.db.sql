CREATE TABLE IF NOT EXISTS "Sets" (
	"ID"	INTEGER NOT NULL UNIQUE,
	"Subjective"	TEXT NOT NULL,
	"Objective"	TEXT NOT NULL,
	"Possessive"	TEXT NOT NULL,
	"Possessive2"	TEXT NOT NULL,
	"Reflexive"	TEXT NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "SetCategories" (
	"ID"	INTEGER NOT NULL UNIQUE,
	"SetID"	INTEGER NOT NULL,
	"CategoryName"	TEXT NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "UserSets" (
	"ID"	INTEGER NOT NULL UNIQUE,
	"UserID"	INTEGER NOT NULL,
	"SetID"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Sentences" (
	"ID"	INTEGER NOT NULL UNIQUE,
	"Sentence"	TEXT NOT NULL UNIQUE,
	"Type"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
