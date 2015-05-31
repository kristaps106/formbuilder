Veidlapas būvēšanas rīks (Laravel)
===============

Installation
------------
1. Get source from git


2. Install vendor libs (to get composer: "curl -sS https://getcomposer.org/installer | php")
php composer.phar install  


Development
-----------
1. Install http://nodejs.org/

2. Install grunt  
npm install -g grunt-cli

3. Load grunt dependencies of package.json  
npm install

4. Installing bower  
npm install -g bower

5. Load bower dependencies  
bower install

6. Use grunt in development  
After edit /app/assets/javascript: grunt concat // Concate files into /public/assets/javascript  
After edit /app/assets/stylesheets: grunt less // Generate css into /public/assets/stylesheet  
To use auto generation: grunt watch // After edit /app/assets/javascript or ./stylesheet - auto generate into /public/assets/...  
To use livereload - need to intall chrome extension "LiveReload" and enable in broser. After call: "grund watch" browser will reload after save :)

Cache
------------

To clear twig cache use this command:
php artisan twig:clear

Doctrine
------------
### Database -> Models
vendor\bin\doctrine-laravel orm:convert-mapping --force --from-database annotation  app/models  
vendor\bin\doctrine-laravel orm:generate-entities --generate-annotations=1 app/models  

### Models -> Database
vendor\bin\doctrine-laravel migrations:diff  
vendor\bin\doctrine-laravel migrations:migrate  
vendor\bin\doctrine-laravel migrations:execute YYYYMMDDHHMMSS  --down  
vendor\bin\doctrine-laravel migrations:execute YYYYMMDDHHMMSS  --up  

Git branch model
----------------

### Release
git checkout -b release-0.7.000 develop  
git commit -a -m 'Fix for release-0.7.000'  
git checkout master  
git merge --no-ff release-0.7.000  
git checkout develop  
git merge --no-ff release-0.7.000  
git tag -a 0.7.000 -m 'User management, classifiers'  
git push origin 0.7.000  
git branch -d release-0.7.000  

### Hotfix
git checkout -b hotfix/name-of-fix master  
git commit -m "Description of fix"  
git checkout master  
git merge --no-ff hotfix/name-of-fix 
git checkout develop  
git merge --no-ff hotfix/name-of-fix
git branch -d hotfix/name-of-fix

Error risinājumi
----------------

### Proxy
Kļūdas paziņojums (daļa):  
"'Doctrine\Common\Proxy\AbstractProxyFactory::getProxyDefinition(): Failed opening required"  
Risinājums:  
1. Laravel root mapē cli-config.php fails  
2. Komanda: vendor\bin\doctrine orm:generate-proxies  

### After: "php composer.phar update" fatal error on update of EntityAudit [2014-12-23]  
1. php composer.phar show -i
2. Reason doctrine/dbal:2.4.3 after update doctrine/dbal:2.5.0
3. Solution "php composer.phar require doctrine/dbal:2.4.3"  

Vēsturiskie dati
----------------

### Lai pievienotu tabulai vēsturisko datu glabāšanu
Entity klases nosaukums jāpievieno iekš faila app/library/EntityAudit/EntityAudit.php masīvā $auditedEntityClasses

### Lai uzģenerētu tabulas
vendor\bin\doctrine-laravel orm:schema-tool:update --dump-sql
vendor\bin\doctrine-laravel orm:schema-tool:update --force

### Lietojums iekš kontrolieriem
$entityHistory = EntityAudit::getReader(App::make('doctrine'))->getEntityHistory('User', 1);
$revisionDiff = EntityAudit::getReader(App::make('doctrine'))->diff('User', 1, 5, 6);
$findRevisions = EntityAudit::getReader(App::make('doctrine'))->findRevisions('User', 1);
Ja autocomplete nedarbojas, pārējās metodes var aplūkot:
vendor/simplethings/entity-audit-bundle/src/SimpleThings/EntityAudit/AuditReader.php

### Ierobežojumi
Currently only works with auto-increment databases
Proper metadata mapping is necessary, allow to disable versioning for fields and associations.
It does NOT work with Joined-Table-Inheritance (Single Table Inheritance should work, but not tested)
Many-To-Many assocations are NOT versioned
Update via DQL or the DQL query builder are NOT versioned

----
## Form builder development
1. Iekš app/assets/formbuilder jāizpilda: bower install
2. Izpilda: npm install grunt-contrib-coffee grunt-contrib-concat grunt-contrib-cssmin grunt-contrib-jst grunt-contrib-stylus grunt-contrib-uglify grunt-contrib-watch grunt-contrib-clean grunt-release grunt-karma
3. Source - app/assets/formbuilder/src
4. Pēc izmaiņām iekš app/assets/formbuilder/src jāizpilda: grunt default
5. CoffeeScript app/assets/formbuilder/src/scripts/main.coffee tiek ģenerēts Javascript /public/assets/javascript/formbuilder.js
6. Stylus app/assets/formbuilder/src/styles/formbuilder.styl tiek ģenerēts CSS /public/assets/stylesheets/formbuilder.css
7. Visam pamatā Backbone & Rivets
8. https://github.com/dobtco/formbuilder


----
## Vue.js lietas
- Lai notīrītu uzsetotu objektu, nepieciešams uzsetot null, piem., this.$set('services', null); .

Debugbar cookies
--------------------------
1. Bookmark to start debugbar
   - javascript:(/** @version 0.5.2 */function() {document.cookie='developer='+'debugbar'+';path=/;';})()
2. Bookmark to stop debugbar
   - javascript:(/** @version 0.5.2 */function() {document.cookie='developer='+''+';expires=Mon, 05 Jul 2000 00:00:00 GMT;path=/;';})()