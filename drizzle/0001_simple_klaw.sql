CREATE TABLE `gameRooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(8) NOT NULL,
	`hostPlayerId` varchar(32) NOT NULL,
	`status` enum('lobby','playing','finished') NOT NULL DEFAULT 'lobby',
	`state` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gameRooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `gameRooms_code_unique` UNIQUE(`code`)
);
