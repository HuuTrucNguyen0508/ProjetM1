## Lien de la présentation 

https://www.canva.com/design/DAGFyLlshOI/fjRAc5ZE143k1rNj58ZzxA/edit

## Ns3

Le fichier "sim-wifi.cc" est le fichier a executé pour obtenir la simulation grâce à ns3. Celui-ci créera un fichier "wifi-sim-anim.xml" qui sera le fichier a importer dans netAnim afin de visualiser la simulation. Après l'execution il y aura également des fichiers représantant les traces de chaque "appareil" qu'on peut ouvrir avec wireshark pour analyser le traffic.


## .cc

En .cpp vous trouverez l'ensemble du code possible pour les différents appareils (device, sensor, access point) comprenant un calcul simple de la trilatération, bien sûre cela doit être alors lié avec la blockchain pour utiliser le bon algo de trilatération et ensuite créer des blocks qui seront envoyé a la blockchain.

## BlockChain

Pour exécuter la partie blockchain, de-zippe le dossier Basic -1 puis l'importer dans RemixIDE. 

![Alt Text](https://github.com/HuuTrucNguyen0508/ProjetM1/blob/main/Images/Screenshot%202024-05-24%20125456.png)

A partir de la, ouvrez le dossier "contracts" et puis appuyez sur le fichier Storage.sol. Ouvrez aussi le dossier "test" et cliquez sur le fichier "storageScripts".

![Alt Text](https://github.com/HuuTrucNguyen0508/ProjetM1/blob/main/Images/Screenshot%202024-05-24%20124018.png)

Ensuite vous devrez appuyer sur l'icône “Solidity Compiler" qui se trouve tout à gauche de l'interface IDE. 
![Alt Text](https://github.com/HuuTrucNguyen0508/ProjetM1/blob/main/Images/Screenshot%202024-05-24%20125110.png)
Appuyez sur "Compile 1_ Storage.sol.

Cliquer sur l'icône “Deploy and Run Transactions" se trouvant aussi à gauche de l'IDE.

![Alt Text](https://github.com/HuuTrucNguyen0508/ProjetM1/blob/main/Images/Screenshot%202024-05-24%20124053.png)
Appuyez sur l'icône orange Deploy et vous trouverez donc une nouvelle interface qui a été créée dans "Deployed/Unpinned Contracts".

Copiez l'adresse du contrat et remplacez le dans "contractAddress" qui se trouve a la fin du fichier "storageScripts" dans la fonction main. 
![Alt Text](https://github.com/HuuTrucNguyen0508/ProjetM1/blob/main/Images/Screenshot%202024-05-24%20124120.png)
![Alt Text](https://github.com/HuuTrucNguyen0508/ProjetM1/blob/main/Images/Screenshot%202024-05-24%20124738.png)

Vous pouvez maintenant appuyer sur le bouton run script et voilà, les informations ont été stockées dans la blockchain.
![Alt Text](https://github.com/HuuTrucNguyen0508/ProjetM1/blob/main/Images/Screenshot%202024-05-24%20130042.png)

Vous pourrez ensuite reprendre ces informations en appuyant sur le bouton "getCoordinates" en sachant que cela est fait directement aussi apres que vous cliquez sur "Run script".

![Alt Text](https://github.com/HuuTrucNguyen0508/ProjetM1/blob/main/Images/Screenshot%202024-05-24%20125826.png)

