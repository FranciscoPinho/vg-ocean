-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: 31-Jul-2018 às 16:29
-- Versão do servidor: 5.7.21
-- PHP Version: 5.6.35

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `ocean'
--
DROP DATABASE IF EXISTS `ocean`;
CREATE DATABASE IF NOT EXISTS `ocean`;
USE `ocean`;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ocean`
--

DELIMITER $$
--
-- Functions
--
DROP FUNCTION IF EXISTS `LEVENSHTEIN`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `LEVENSHTEIN` (`s1` VARCHAR(255), `s2` VARCHAR(255)) RETURNS INT(11) BEGIN
    DECLARE s1_len, s2_len, i, j, c, c_temp, cost INT;
    DECLARE s1_char CHAR;
    DECLARE cv0, cv1 VARBINARY(256);
    SET s1_len = CHAR_LENGTH(s1), s2_len = CHAR_LENGTH(s2), cv1 = 0x00, j = 1, i = 1, c = 0;
    IF s1 = s2 THEN
        RETURN 0;
    ELSEIF s1_len = 0 THEN
        RETURN s2_len;
    ELSEIF s2_len = 0 THEN
        RETURN s1_len;
    ELSE
        WHILE j <= s2_len DO
            SET cv1 = CONCAT(cv1, UNHEX(HEX(j))), j = j + 1;
        END WHILE;
        WHILE i <= s1_len DO
            SET s1_char = SUBSTRING(s1, i, 1), c = i, cv0 = UNHEX(HEX(i)), j = 1;
            WHILE j <= s2_len DO
                SET c = c + 1;
                IF s1_char = SUBSTRING(s2, j, 1) THEN SET cost = 0; ELSE SET cost = 1; END IF;
                SET c_temp = CONV(HEX(SUBSTRING(cv1, j, 1)), 16, 10) + cost;
                IF c > c_temp THEN SET c = c_temp; END IF;
                SET c_temp = CONV(HEX(SUBSTRING(cv1, j+1, 1)), 16, 10) + 1;
                IF c > c_temp THEN SET c = c_temp; END IF;
                SET cv0 = CONCAT(cv0, UNHEX(HEX(c))), j = j + 1;
            END WHILE;
            SET cv1 = cv0, i = i + 1;
        END WHILE;
    END IF;
    RETURN c;
END$$

DROP FUNCTION IF EXISTS `LEVENSHTEIN_RATIO`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `LEVENSHTEIN_RATIO` (`s1` VARCHAR(255), `s2` VARCHAR(255)) RETURNS INT(11) BEGIN
    DECLARE s1_len, s2_len, max_len INT;
    SET s1_len = LENGTH(s1), s2_len = LENGTH(s2);
    IF s1_len > s2_len THEN SET max_len = s1_len; ELSE SET max_len = s2_len; END IF;
    RETURN ROUND((1 - LEVENSHTEIN(s1, s2) / max_len) * 100);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `developer`
--

DROP TABLE IF EXISTS `developer`;
CREATE TABLE IF NOT EXISTS `developer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `game`
--

DROP TABLE IF EXISTS `game`;
CREATE TABLE IF NOT EXISTS `game` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `alt_title` varchar(255) DEFAULT NULL,
  `description` text,
  `cover_uri` varchar(255) DEFAULT NULL,
  `time_to_beat` time DEFAULT NULL,
  `time_to_complete` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `gamedeveloper`
--

DROP TABLE IF EXISTS `gamedeveloper`;
CREATE TABLE IF NOT EXISTS `gamedeveloper` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `devID` int(11) NOT NULL,
  `gameID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gameDevCombo` (`devID`,`gameID`),
  KEY `gamedeveloper_game_fk` (`gameID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `gamegenre`
--

DROP TABLE IF EXISTS `gamegenre`;
CREATE TABLE IF NOT EXISTS `gamegenre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `genreID` int(11) NOT NULL,
  `gameID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_genre_combo` (`genreID`,`gameID`) USING BTREE,
  KEY `gamegenre_game_fk` (`gameID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `gameplatform`
--

DROP TABLE IF EXISTS `gameplatform`;
CREATE TABLE IF NOT EXISTS `gameplatform` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `platformID` int(11) NOT NULL,
  `gameID` int(11) NOT NULL,
  `release_US` text,
  `release_EU` text,
  `release_JP` text,
  `steamID` int(11) DEFAULT NULL,
  `steam_score` tinytext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plat_combo` (`platformID`,`gameID`),
  KEY `gameplatform_game_fk` (`gameID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `gamepublisher`
--

DROP TABLE IF EXISTS `gamepublisher`;
CREATE TABLE IF NOT EXISTS `gamepublisher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `publisherID` int(11) NOT NULL,
  `gameID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gamePublisherCombo` (`publisherID`,`gameID`),
  KEY `gamepublisher_game_fk` (`gameID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `genre`
--

DROP TABLE IF EXISTS `genre`;
CREATE TABLE IF NOT EXISTS `genre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `platform`
--

DROP TABLE IF EXISTS `platform`;
CREATE TABLE IF NOT EXISTS `platform` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET latin1 NOT NULL,
  `family` tinytext CHARACTER SET latin1 NOT NULL,
  `released` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `platform`
--

INSERT INTO `platform` (`id`, `name`, `family`, `released`) VALUES
(1, 'Nintendo Entertainment System', 'Nintendo', '1983-07-15');

-- --------------------------------------------------------

--
-- Estrutura da tabela `publisher`
--

DROP TABLE IF EXISTS `publisher`;
CREATE TABLE IF NOT EXISTS `publisher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `game`
--
ALTER TABLE `game` ADD FULLTEXT KEY `title_match` (`title`,`alt_title`);

--
-- Constraints for dumped tables
--

--
-- Limitadores para a tabela `gamedeveloper`
--
ALTER TABLE `gamedeveloper`
  ADD CONSTRAINT `gamedeveloper_developer_fk` FOREIGN KEY (`devID`) REFERENCES `developer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamedeveloper_game_fk` FOREIGN KEY (`gameID`) REFERENCES `game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `gamegenre`
--
ALTER TABLE `gamegenre`
  ADD CONSTRAINT `gamegenre_game_fk` FOREIGN KEY (`gameID`) REFERENCES `game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamegenre_genre_fk` FOREIGN KEY (`genreID`) REFERENCES `genre` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `gameplatform`
--
ALTER TABLE `gameplatform`
  ADD CONSTRAINT `gameplatform_game_fk` FOREIGN KEY (`gameID`) REFERENCES `game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gameplatform_platform_fk` FOREIGN KEY (`platformID`) REFERENCES `platform` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `gamepublisher`
--
ALTER TABLE `gamepublisher`
  ADD CONSTRAINT `gamepublisher_game_fk` FOREIGN KEY (`gameID`) REFERENCES `game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamepublisher_publisher_fk` FOREIGN KEY (`publisherID`) REFERENCES `publisher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
