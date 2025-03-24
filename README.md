# BlockTask

## Prérequis
- `npx`
- `metamask`

## Lancement de l'app

Dans un premier terminal:
```bash
npx install "express" "hardhat" "ethers" "dotenv" "@nomicfoundation/hardhat-toolbox" "@nomicfoundation/hardhat-ignition" "react" "web3" --save
npx hardhat node
```
Cela créera 20 nodes de 10000 ETH chacune.
Importez le portefeuille d'une node dans metamask:
`Account 1 > Add account or hardware wallet > Import account`
Coller la clé privé de l'une des nodes puis `Import`

Connectez vous au réseau localhost:
| Default RPC URL | Chain ID  | Currency symbol
| --- | --- | --- 
| `localhost:8545` | `1337` | `ETH` 

Connectez le compte "Account 2"
Dans un second terminal:
```bash
npm i 
npx hardhat compile
npx hardhat ignition deploy ignition/modules/Deploy.js --network localhost
npm start
```

Rendez-vous ensuite à l'adresse [http://localhost:3000](http://localhost:3000)