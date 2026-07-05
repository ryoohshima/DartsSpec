CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `parts` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`brand` text NOT NULL,
	`series` text,
	`name` text NOT NULL,
	`standard` text,
	`spec` text NOT NULL,
	`image_url` text,
	`is_active` integer DEFAULT true,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `parts_category_brand_idx` ON `parts` (`category`,`brand`);--> statement-breakpoint
CREATE INDEX `parts_name_idx` ON `parts` (`name`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`barrel_id` text,
	`shaft_id` text,
	`flight_id` text,
	`tip_id` text,
	`total_weight_g` real,
	`total_length_mm` real,
	`visibility` text DEFAULT 'public',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`barrel_id`) REFERENCES `parts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shaft_id`) REFERENCES `parts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flight_id`) REFERENCES `parts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tip_id`) REFERENCES `parts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`handle` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_handle_unique` ON `user` (`handle`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
