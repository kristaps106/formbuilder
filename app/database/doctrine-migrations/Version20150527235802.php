<?php

namespace DoctrineMigrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150527235802 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE audit_log (id INT AUTO_INCREMENT NOT NULL COMMENT \'Auditu ierakstu tabulas primārā atslēga\', event VARCHAR(255) NOT NULL COMMENT \'Notikuma nosaukums\', info LONGTEXT DEFAULT NULL COMMENT \'Notikuma apraksts\', ip VARCHAR(255) NOT NULL COMMENT \'Lietotāja IP adrese\', created_at DATETIME NOT NULL COMMENT \'Ieraksta pievienošanas datums\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB COMMENT = \'Auditu ierakstu tabula\' ');
        $this->addSql('CREATE TABLE forms_field (id INT AUTO_INCREMENT NOT NULL COMMENT \'Veidlapu lauku tabulas primārā atslēga\', form_id INT DEFAULT NULL COMMENT \'Veidlapu sagatavju tabulas primārā atslēga\', field_id VARCHAR(100) DEFAULT NULL COMMENT \'Lauka identifikators\', field_type VARCHAR(255) NOT NULL COMMENT \'Lauka tips\', field_name VARCHAR(255) DEFAULT NULL COMMENT \'Lauka nosaukums\', field_formula LONGTEXT DEFAULT NULL COMMENT \'Lauka formula\', field_format VARCHAR(255) DEFAULT NULL COMMENT \'Lauka formāts\', field_options LONGTEXT DEFAULT NULL COMMENT \'Lauka parametri\', field_validation_level VARCHAR(255) DEFAULT NULL COMMENT \'Lauka pārbaudes līmenis\', field_validation_message VARCHAR(255) DEFAULT NULL COMMENT \'Lauka pārbaudes brīdinājuma teksts\', save_to VARCHAR(255) DEFAULT NULL COMMENT \'Pēc apstiprināšanas lauka vērtības saglabāšanas definīcija\', INDEX IDX_DB3E2E825FF69B7D (form_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB COMMENT = \'Veidlapu lauku tabula\' ');
        $this->addSql('CREATE TABLE forms_field_audit (id INT NOT NULL COMMENT \'Veidlapu lauku tabulas primārā atslēga\', rev INT NOT NULL, form_id INT DEFAULT NULL COMMENT \'Veidlapu sagatavju tabulas primārā atslēga\', field_id VARCHAR(100) DEFAULT NULL COMMENT \'Lauka identifikators\', field_type VARCHAR(255) DEFAULT NULL COMMENT \'Lauka tips\', field_name VARCHAR(255) DEFAULT NULL COMMENT \'Lauka nosaukums\', field_formula LONGTEXT DEFAULT NULL COMMENT \'Lauka formula\', field_format VARCHAR(255) DEFAULT NULL COMMENT \'Lauka formāts\', field_options LONGTEXT DEFAULT NULL COMMENT \'Lauka parametri\', field_validation_level VARCHAR(255) DEFAULT NULL COMMENT \'Lauka pārbaudes līmenis\', field_validation_message VARCHAR(255) DEFAULT NULL COMMENT \'Lauka pārbaudes brīdinājuma teksts\', save_to VARCHAR(255) DEFAULT NULL COMMENT \'Pēc apstiprināšanas lauka vērtības saglabāšanas definīcija\', revtype VARCHAR(4) NOT NULL, PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE forms_post (id INT AUTO_INCREMENT NOT NULL COMMENT \'Dokumentu tabulas primārā atslēga\', form_id INT DEFAULT NULL COMMENT \'Veidlapu sagatavju tabulas primārā atslēga\', status VARCHAR(255) NOT NULL COMMENT \'Dokumenta statuss\', created_at DATETIME NOT NULL COMMENT \'Ieraksta pievienošanas datums\', modified_at DATETIME NOT NULL COMMENT \'Ieraksta rediģēšanas datums\', INDEX IDX_F4867D185FF69B7D (form_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB COMMENT = \'Dokumentu tabula\' ');
        $this->addSql('CREATE TABLE forms_post_audit (id INT NOT NULL COMMENT \'Dokumentu tabulas primārā atslēga\', rev INT NOT NULL, form_id INT DEFAULT NULL COMMENT \'Veidlapu sagatavju tabulas primārā atslēga\', status VARCHAR(255) DEFAULT NULL COMMENT \'Dokumenta statuss\', created_at DATETIME DEFAULT NULL COMMENT \'Ieraksta pievienošanas datums\', modified_at DATETIME DEFAULT NULL COMMENT \'Ieraksta rediģēšanas datums\', revtype VARCHAR(4) NOT NULL, PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE forms_post_value (id INT AUTO_INCREMENT NOT NULL COMMENT \'Dokumentu vērtību tabulas primārā atslēga\', post_id INT DEFAULT NULL COMMENT \'Dokumentu tabulas primārā atslēga\', field_id INT DEFAULT NULL COMMENT \'Veidlapu lauku tabulas primārā atslēga\', value VARCHAR(255) DEFAULT NULL COMMENT \'Dokumentu vērtību tabulas primārā atslēga\', modified_at DATETIME NOT NULL COMMENT \'Ieraksta rediģēšanas datums\', INDEX IDX_37722CB4B89032C (post_id), INDEX IDX_37722CB443707B0 (field_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB COMMENT = \'Dokumentu vērtību tabula\' ');
        $this->addSql('CREATE TABLE forms_post_value_audit (id INT NOT NULL COMMENT \'Dokumentu vērtību tabulas primārā atslēga\', rev INT NOT NULL, post_id INT DEFAULT NULL COMMENT \'Dokumentu tabulas primārā atslēga\', field_id INT DEFAULT NULL COMMENT \'Veidlapu lauku tabulas primārā atslēga\', value VARCHAR(255) DEFAULT NULL COMMENT \'Dokumentu vērtību tabulas primārā atslēga\', modified_at DATETIME DEFAULT NULL COMMENT \'Ieraksta rediģēšanas datums\', revtype VARCHAR(4) NOT NULL, PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE forms_template (id INT AUTO_INCREMENT NOT NULL COMMENT \'Veidlapu sagatavju tabulas primārā atslēga\', parent_id INT DEFAULT NULL COMMENT \'Sagataves vecāka identifikators\', name VARCHAR(255) NOT NULL COMMENT \'Sagataves nosaukums\', content LONGTEXT NOT NULL COMMENT \'Sagatave saturs JSON formātā\', status VARCHAR(255) NOT NULL COMMENT \'Sagataves statuss\', created_at DATETIME NOT NULL COMMENT \'Ieraksta pievienošanas datums\', version INT NOT NULL COMMENT \'Sagataves versija\', modified_at DATETIME NOT NULL COMMENT \'Ieraksta rediģēšanas datums\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB COMMENT = \'Veidlapu sagatavju tabula\' ');
        $this->addSql('CREATE TABLE forms_template_audit (id INT NOT NULL COMMENT \'Veidlapu sagatavju tabulas primārā atslēga\', rev INT NOT NULL, parent_id INT DEFAULT NULL COMMENT \'Sagataves vecāka identifikators\', name VARCHAR(255) DEFAULT NULL COMMENT \'Sagataves nosaukums\', content LONGTEXT DEFAULT NULL COMMENT \'Sagatave saturs JSON formātā\', status VARCHAR(255) DEFAULT NULL COMMENT \'Sagataves statuss\', created_at DATETIME DEFAULT NULL COMMENT \'Ieraksta pievienošanas datums\', version INT DEFAULT NULL COMMENT \'Sagataves versija\', modified_at DATETIME DEFAULT NULL COMMENT \'Ieraksta rediģēšanas datums\', revtype VARCHAR(4) NOT NULL, PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE revisions (id INT AUTO_INCREMENT NOT NULL, timestamp DATETIME NOT NULL, username VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE forms_field ADD CONSTRAINT FK_DB3E2E825FF69B7D FOREIGN KEY (form_id) REFERENCES forms_template (id)');
        $this->addSql('ALTER TABLE forms_post ADD CONSTRAINT FK_F4867D185FF69B7D FOREIGN KEY (form_id) REFERENCES forms_template (id)');
        $this->addSql('ALTER TABLE forms_post_value ADD CONSTRAINT FK_37722CB4B89032C FOREIGN KEY (post_id) REFERENCES forms_post (id)');
        $this->addSql('ALTER TABLE forms_post_value ADD CONSTRAINT FK_37722CB443707B0 FOREIGN KEY (field_id) REFERENCES forms_field (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE forms_post_value DROP FOREIGN KEY FK_37722CB443707B0');
        $this->addSql('ALTER TABLE forms_post_value DROP FOREIGN KEY FK_37722CB4B89032C');
        $this->addSql('ALTER TABLE forms_field DROP FOREIGN KEY FK_DB3E2E825FF69B7D');
        $this->addSql('ALTER TABLE forms_post DROP FOREIGN KEY FK_F4867D185FF69B7D');
        $this->addSql('DROP TABLE audit_log');
        $this->addSql('DROP TABLE forms_field');
        $this->addSql('DROP TABLE forms_field_audit');
        $this->addSql('DROP TABLE forms_post');
        $this->addSql('DROP TABLE forms_post_audit');
        $this->addSql('DROP TABLE forms_post_value');
        $this->addSql('DROP TABLE forms_post_value_audit');
        $this->addSql('DROP TABLE forms_template');
        $this->addSql('DROP TABLE forms_template_audit');
        $this->addSql('DROP TABLE revisions');
    }
}
