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