CREATE TYPE "public"."kanryo_task_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TABLE "kanryo_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"status" "kanryo_task_status" DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"jst_date" date NOT NULL,
	"daily_seq" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kanryo_tasks_user_id_jst_date_daily_seq_key" UNIQUE("user_id","jst_date","daily_seq"),
	CONSTRAINT "kanryo_tasks_status_completed_at_check" CHECK (("kanryo_tasks"."status" = 'completed') = ("kanryo_tasks"."completed_at" is not null))
);
--> statement-breakpoint
ALTER TABLE "kanryo_tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "kanryo_tasks" ADD CONSTRAINT "kanryo_tasks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kanryo_tasks_created_at_id_idx" ON "kanryo_tasks" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "kanryo_tasks_user_id_status_idx" ON "kanryo_tasks" USING btree ("user_id","status");--> statement-breakpoint
CREATE POLICY "kanryo_tasks are viewable by authenticated users" ON "kanryo_tasks" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "users can insert own pending kanryo_tasks" ON "kanryo_tasks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "kanryo_tasks"."user_id" and "kanryo_tasks"."status" = 'pending' and "kanryo_tasks"."completed_at" is null);--> statement-breakpoint
CREATE POLICY "users can update own kanryo_tasks" ON "kanryo_tasks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "kanryo_tasks"."user_id") WITH CHECK ((select auth.uid()) = "kanryo_tasks"."user_id");