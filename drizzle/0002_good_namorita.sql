ALTER TABLE "sites" ADD COLUMN "client_email" text;--> statement-breakpoint
CREATE INDEX "sites_client_email_idx" ON "sites" USING btree ("client_email");