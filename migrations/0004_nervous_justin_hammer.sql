CREATE TABLE "note_versions_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"note_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes_table" ADD COLUMN "current_version_id" integer;--> statement-breakpoint
ALTER TABLE "note_versions_table" ADD CONSTRAINT "note_versions_table_note_id_notes_table_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_table" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "notes_table" DROP COLUMN "content";