CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"role" text DEFAULT 'viewer',
	"status" text DEFAULT 'pending',
	"invite_token" text,
	"invited_at" timestamp DEFAULT now(),
	"accepted_at" timestamp,
	"permissions" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_members_owner_id_idx" ON "team_members" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "team_members_user_id_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_members_email_idx" ON "team_members" USING btree ("email");