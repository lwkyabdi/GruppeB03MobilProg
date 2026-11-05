CREATE TABLE `watchlist_entry` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`tmdb_id` integer NOT NULL,
	`title` text NOT NULL,
	`poster_path` text,
	`status` text DEFAULT 'wanted' NOT NULL,
	`rating` integer,
	`favorite` integer DEFAULT false NOT NULL,
	`comment` text,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_watchlist_entry_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `uq_watchlist_user_tmdb` UNIQUE(`user_id`,`tmdb_id`)
);
