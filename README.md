# Nijkamp API

## Pre-configured wallet and contract used for the proof of concept

### Admin Wallet (used to deploy Notarization contract)
```
Owner private key:  <contact us to get this key, not published on this public repo>
Owner address:      0x2c553564Ab17d769C5e81433a4628536c4E83647
```

### Notarization Contract
```
Notarization Contract Address: 0xFaDFB170d96B16F487BE5d2640cA225F858d9824
```

This admin address and notarization contract are both deployed on the Mumbai Testnet and can be used for testing/demos but a new wallet and a new contract should be created in production on the Polygon Mainnet.

## Deployments

:warning:

The whole pre-installation is already done and the application can be launched as-is, with the current values provided in environment variables.                

**So you can skip this section, unless if you want to completely reboot the installation, which you should for production.**

On the first deployment or for reinstalling from scratch, the system requires some initial setup: 
- An admin wallet
- A deployed notarization contract

Some scripts are provided to help this pre-installation process.


1. **Create wallet**

This script outputs a new generated wallet.
```bash
$ node scripts/create-wallet

output:
{
  wallet: {
    address: '0x....',
    publicKey: '0x....',
    mnemonic: 'fatigue gown pitch august ...',
    privateKey: '0x....'
  }
}
```
Run the script and **copy the private key in a text file**.      
On your machine, create a text file and paste the private key like this:
```
ADMIN_KEY=0x....
```

The key will be used to deploy the notarization contract.

2. **Deploy the notarization contract**

The following script requires two arguments.         
- privateKey: it is the ADMIN_KEY that we have generated.
- provider: it is the url to connect to a node using JSON-RPC. For the Polygon testnet, this url is ```https://rpc-mumbai.maticvigil.com```

```bash
$ node scripts/deploy-notarization --privateKey <your-ADMIN_KEY> --provider <blockchain-entry-point>

output:
 "Contract address: 0x...."
```
Run the script and save the address in your text file like this: 
```
NOTARIZATION_CONTRACT_ADDRESS = 0x....
```

4. **Setup the environment variables**

Open the file at project root named ```.env.dev``` (for development) an/or the ```.env.prod``` (for production).          
Just copy/paste your text file content inside the desired env file (replace pre-existing values if you don't need them anymore).


## Environment variables

| name | value | example | default (only if dockerized) |
| --- | --- | --- | --- |
| ```NODE_ENV``` | development \|\| production \|\| test | development | production |
| ```API_PORT``` | number | 3000 | 42003 |
| ```WITH_SWAGGER``` | 'yes' or anything else  | yes | no |
| ```MONGODB_URI``` | mongodb uri | mongodb://app_user:app_user@localhost:42009/nijkamp | mongodb://app_user:app_user@mongo_db:27017/nijkamp  |
| ```ADMIN_KEY``` | string | 0xsomeprivatekey | - |
| ```BLOCKCHAIN_RPC_URL_PORT``` | url + port to RPC node  | http://127.0.0.1:7545 | http://host:port/rpc |
| ```NOTARIZATION_CONTRACT_ADDRESS``` | string | 0xsomecontractaddress | - |
| ```MONGO_PORT``` | number | 42009 | 42009 |
| ```APP_USER``` | string | app_user | app_user |
| ```APP_PWD``` | string | app_user | app_user |
| ```DB_NAME``` | string | nijkamp | nijkamp |

## Running the app in dev mode

You need to install the packages:
```bash
$ npm install
```

Then launch the database:
```bash
$ npm run docker:dev:up
```

Then launch the app:
```bash
# without watch mode
$ npm run start

# watch mode
$ npm run start:dev
```

Stop the database with: 
```bash
$ npm run docker:dev:down
```


## Running the app in prod mode
There is no real production mode as this project is a proof of concept.      
But we emulate production by dockerizing everything, allowinf for easy deployment (on AWS EC2 for example).

Just run: 
```bash
$ npm run docker:prod:up
```

Stop it with: 
```bash
$ npm run docker:prod:down
```

# Contact
**block0**
+ info@block0.io
+ [https://block0.io/](https://block0.io/)

# License
This repository is released under the [MIT License](https://opensource.org/licenses/MIT).
