ALTER TABLE "posts_table" RENAME TO "notes_table";--> statement-breakpoint
ALTER TABLE "notes_table" DROP CONSTRAINT "posts_table_user_id_users_table_id_fk";
--> statement-breakpoint
ALTER TABLE "notes_table" ADD CONSTRAINT "notes_table_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;