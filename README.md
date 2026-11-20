IaaS Instanz erstellen -> Benötigte Rollen: roles/compute.instanceAdmin.v1.
Region per Region Calc "ausgerechnet" und auf europe-west4-a (Niederlande) gesetzt. Könnte auch Frankfurt sein da näher, aber fals CO2 wichtig ist eher Niederlande.
Maschinentyp E2-micro aufgrund niedrieger Kosten sowie dem Grund, dass unsere App ganz klein ist und nicht viel Ressourcen benötigt 
Standartbereitstellungsmodell
Betriebssystem ubuntu 24.04 LTS, da dieses sehr gut Dokumentiert sein soll und weit verbreitet für Web-Anwendungen. Kostenloser Support für Securitiy Updates bis 2029 und keine extra Kosten.
HTTO und HTTPS Zugriff zulassen, Load balancer noch nicht benötigt. HTTPS könnte später mit TLS Konfig genutzt werden aber bisher brauchen wir nur simples HTTP.
Rest auf Standart gelassen.
Monatlicher Schätzwert
7,83 $
Das sind etwa 0,01 $ pro Stunde

SSH Verbindung meine commands:
Alle offenen Updates und Upgrades herunterladen
sudo apt update
sudo apt upgrade -y
Git, Curl und Node installiern
sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

git clone und npm install

Firewallregel todo-app erstellt für port 8080 und tag gesetzt und diesen in Netzwerkkonfig der VM eingestelltm dadurch kann man die Seite aufrufen


*Frage unterschied das Cloud Projekt auf eine bestimmte Zonse zu setzen und die VM z.B. seperat auf eine


PaaS mit App Engine

Link: https://einf-cloud-computing.ey.r.appspot.com

Region ist europe-west3 (Frankfurt). Niederlande wie bei der VM ging nicht, weil es App Engine dort gar nicht gibt. Frankfurt ist von uns aus am nächsten, deshalb haben wir das genommen. Die Region kann man danach nicht mehr ändern, pro Projekt gibt es nur eine App Engine App.

Beim Anlegen gab es erst einen Fehler (IAM_PERMISSION_DENIED), obwohl ich (sebi) Bearbeiter und App Engine Admin war. Die App anlegen darf nur der Projekt Inhaber, deshalb hat Emre das gemacht:
gcloud app create --region=europe-west3 --project=einf-cloud-computing
Danach konnte ich ganz normal deployen.

Statt wie bei IaaS eine ganze VM zu mieten und darauf alles selbst einzurichten, mussten wir hier nur zwei Dateien anlegen und einen Befehl ausführen. In der app.yaml steht, dass wir Node.js 22 brauchen, die kleinste Instanz (F1) und höchstens eine Instanz, damit keine Kosten ausufern. Die package.json im Hauptordner sagt Google, wie die App gebaut und gestartet wird (gcp-build installiert die Abhängigkeiten in app/, start startet app/server.js). Dazu noch eine .gcloudignore, damit node_modules und .git nicht mit hochgeladen werden.
Die Dateien liegen im Hauptordner und nicht in app/, weil gcloud nur den Ordner hochlädt in dem die app.yaml liegt. Die CSS liegt aber in ressources/ und hätte sonst gefehlt. So mussten wir am Code von der VM Version nichts ändern.

Deployen im Hauptordner mit:
gcloud app deploy
Den Rest hat Google komplett automatisch gemacht, also Node installieren, npm install, App starten und von außen erreichbar machen. Kein SSH, kein apt install, keine Firewallregel und kein npm start per Hand. Hat ein paar Minuten gedauert und dann lief die Seite direkt mit HTTPS.

Was auch angenehm ist: Man muss hier nichts stoppen wie bei der VM. Wenn keiner die Seite aufruft, fährt App Engine die Instanz von selbst auf 0 runter und es kostet nichts. Man muss also einfach gar nichts tun. Dafür hat man weniger Kontrolle, man kann eigentlich nur über die app.yaml etwas einstellen und kommt nicht an das System selbst ran.

Wir haben einmal lokal über das Google Cloud SDK auf dem Mac und einmal über die Cloud Shell im Browser deployt. Der Befehl war beide Male gcloud app deploy und das Ergebnis ist quasi genau gleich, die Seite sieht gleich aus und läuft unter derselben URL. Ehrlich gesagt wissen wir nicht genau, weshalb wir das 2x machen mussten. Unterschied war nur, dass wir in der Cloud Shell das Google Cloud SDK nicht installieren und uns nicht einloggen mussten, dafür aber erst das Repo von GitHub klonen. Mit gcloud app versions list sieht man danach beide Versionen, die neue bekommt automatisch den ganzen Traffic und die alte bleibt noch da.
