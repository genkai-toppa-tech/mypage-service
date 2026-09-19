CREATE TABLE "kanryo_task_likes" (
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kanryo_task_likes_task_id_user_id_pk" PRIMARY KEY("task_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "kanryo_task_likes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "kanryo_task_likes" ADD CONSTRAINT "kanryo_task_likes_task_id_kanryo_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."kanryo_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanryo_task_likes" ADD CONSTRAINT "kanryo_task_likes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kanryo_task_likes_task_id_idx" ON "kanryo_task_likes" USING btree ("task_id");--> statement-breakpoint
CREATE POLICY "kanryo_task_likes are viewable by authenticated users" ON "kanryo_task_likes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "users can like as themselves" ON "kanryo_task_likes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "kanryo_task_likes"."user_id");--> statement-breakpoint
CREATE POLICY "users can unlike their own like" ON "kanryo_task_likes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "kanryo_task_likes"."user_id");