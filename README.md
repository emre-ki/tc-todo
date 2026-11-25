## IaaS mit Compute Engine

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

## PaaS mit App Engine

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


## FaaS mit Cloud Functions

Zwei Funktionen im Ordner functions/, beide in europe-west3 (Frankfurt).

todos (Node.js 22): https://europe-west3-einf-cloud-computing.cloudfunctions.net/todos
Unsere server.js als einzelne Funktion. GET gibt alle Todos zurück, POST legt eins an. Express und app.listen fallen weg, das macht Google.

stats (Python 3.13): https://europe-west3-einf-cloud-computing.cloudfunctions.net/stats
Bekommt eine Todo Liste und gibt zurück wie viele erledigt und offen sind und wie viel Prozent geschafft ist. Speichert nichts, rechnet nur.

Pro Funktion braucht man nur den Code, eine package.json bzw. requirements.txt mit den Paketen und eine .gcloudignore, damit node_modules bzw. das venv nicht mit hochgeladen werden.


### Deployen

Jeweils im Ordner der Funktion:
gcloud functions deploy todos --gen2 --runtime=nodejs22 --region=europe-west3 --source=. --entry-point=todos --trigger-http --allow-unauthenticated --max-instances=1
gcloud functions deploy stats --gen2 --runtime=python313 --region=europe-west3 --source=. --entry-point=stats --trigger-http --allow-unauthenticated --max-instances=1
Beim ersten Mal fragt gcloud ob es ein paar APIs aktivieren soll, einfach mit y bestätigen. --allow-unauthenticated heißt jeder darf die URL ohne Login aufrufen, --max-instances=1 ist wieder die Kostenbremse.

### Testen mit curl

curl https://europe-west3-einf-cloud-computing.cloudfunctions.net/todos
curl -X POST -H "Content-Type: application/json" -d '{"text":"Hausaufgaben"}' https://europe-west3-einf-cloud-computing.cloudfunctions.net/todos
curl -X POST -H "Content-Type: application/json" -d '[{"text":"Einkaufen","done":true},{"text":"Lernen","done":false},{"text":"Sport","done":true}]' https://europe-west3-einf-cloud-computing.cloudfunctions.net/stats
Die letzte Antwort war {"erledigt":2,"gesamt":3,"offen":1,"prozent_erledigt":67}.

### Was wir gemerkt haben

Die Todos sind nach einer Weile einfach wieder weg. Wir haben morgens "Hausaufgaben" angelegt und etwas später kam bei GET wieder eine leere Liste. Die Liste liegt nur im Arbeitsspeicher und wenn keiner die Funktion aufruft räumt Google sie weg. Bei der VM und bei App Engine lief der Server länger am Stück, deshalb ist uns das da nicht passiert. Für eine echte Todo App bräuchte man also eine Datenbank, eine Funktion allein kann sich nichts merken (zustandslos).

Ehrlich gesagt haben wir erst deployt und dann committet. Das geht, weil gcloud einfach den Ordner so hochlädt wie er auf dem Rechner liegt. Eigentlich sollte man aber erst committen, damit man weiß welcher Stand in der Cloud läuft.

### Docker
Alle relevanten Ordner mit Code oder CSS in /app verschoben. Darin Dockerfile und Dockerignore erstellt. Dockerignore damit beim Build nichts überschrieben / neuinstalliert wird.
Dockerfile simpel aufgebaut, auch vom Aufbau im Internet zu finden. Erstes Image gebaut mit docker build -t todo-app und nochmal mit docker images gecheckt (im Ordner /app).
Starten über docker run -p 8080:8080 todo-app. Dann sieht man auch in Docker Desktop das es läuft und man kann die Seite aufrufen. ÜBer Desktop App oder Terminal dann wieder beenden.

Docker Images sind Snapshots vom code, weswegen bei änderungen das Dockerimage neu gebaut werden muss. Immer Version erhöhen.

Deployed wurde das Image per:
gcloud run deploy todo-container --image europe-west3-docker.pkg.dev/einf-cloud-computing/todo-repo/todo-app:v2 --region europe-west3

https://todo-container-860957730183.europe-west3.run.app

1 Image wird dann quasi für GKE und Cloud Run verwendet

### GKE
Plugins installieren: gcloud components install kubectl gke-gcloud-auth-plugin

Erstellung von Cluster mit gcloud container clusters create-auto todo-cluster --location=europe-west3, create-auto weil Google dann selbst die Nodes verwaltet. Weniger Kontrolle aber weniger arbeit, in dem kleinen Projekt eigentlich beides machbar. Danach mit container mit get-creditentials verbunden.
replicas ist auf 1 gesetzt. Das ist ein Pod, was für unsere größe ausreicht. Durch einen Autoscaler (HPA) kann man je nacht auslastung der Ressourcen automatisch die Pods vergrößern.
Dann müsste man auch grenzen Setzen (min, max), damit es nicht ins unendliche geht und hohe kosten verursacht. Unsere App ist bisher nicht Zustandslos weswegen es keinen Sinn macht das einzubauen.

Image: `europe-west3-docker.pkg.dev/einf-cloud-computing/todo-repo/todo-app:v2`

Cluster erstellen und deployen:
gcloud container clusters create-auto todo-cluster --location=europe-west3
gcloud container clusters get-credentials todo-cluster --location europe-west3
kubectl apply -f deploy/k8s/   # Das Image hierzu ist im yaml
kubectl get service todo-app --watch
Wenn läuft kriegt man eine IP zum aufrufen

Wieder löschen wenn nicht genutzt da kosten laufen:
kubectl delete -f deploy/k8s/
gcloud container clusters delete todo-cluster --location europe-west3

Prüfen:
gcloud container clusters list