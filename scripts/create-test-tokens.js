/* eslint-disable @typescript-eslint/no-var-requires */
const { ethJws } = require('eth-jws');

const keys = {
  hatchery: '0xc2ad586ce7f4a99c5df3406f688f8603b327c734f7414778f395567d2c0abf69',
  farmer: '0x9830ccd8d0f6a7b1b1dc0dd73561dbed1a19ca4bfb4506c959a67878f6adfe31',
  slaughterhouse: '0x30e7dc65be24defa6c31f867a6783c138dce055a04773c9834c3d1ff5197e8c7',
  laboratory: '0xa32709f53b16f0d1fc3431c13b789154ccef01cfbecb578e5e170e33312ef8f8',
};

const payloads = {
  hatchery: {
    setupBatch: {
      opName: 'setupBatch',
      batchId: 'H1B1',
      origins: [],
    },
    pushData: {
      opName: 'pushHatcheryData',
      batchId: 'H1B1',
      race: 'Hubbard JA-757 ProCare',
      units: 29780,
      breederId: 'breeder001',
      hatcheryKipId: '12345-1234-1234',
      farmerSetupDate: 1656547568,
    },
    releaseBatch: {
      opName: 'releaseBatch',
      batchId: 'H1B1',
      destinations: [
        '0xED456077E28Fe92a64dd7CC7E91fe2A470Fa03D0', // farmer 1
        '0x83bD7c3E082D52a730c19A5FF00bFecEC05Eb8F0', // farmer 2
      ],
    },
    releaseBatchWithoutFarmer1: {
      opName: 'releaseBatch',
      batchId: 'H1B1',
      destinations: [
        '0x83bD7c3E082D52a730c19A5FF00bFecEC05Eb8F0', // farmer 2
      ],
    },
    getBatch: {
      opName: 'getBatch',
      batchId: 'H1B1',
    },
    getProductionChain: {
      opName: 'getProductionChain',
      batchId: 'H1B1',
    },
    'searchNotarization using a regex string': {
      opName: 'findNotarizations',
      batchId: 'H1B1',
      query: {
        race: 'Hub',
      },
    },
    'searchNotarization using exact number': {
      opName: 'findNotarizations',
      batchId: 'H1B1',
      query: {
        units: 29780,
      },
    },
    'searchNotarization using multi keys (AND)': {
      opName: 'findNotarizations',
      batchId: 'H1B1',
      query: {
        race: 'h',
        units: 29780,
      },
    },
    'searchNotarization using empty string => 400': {
      opName: 'findNotarizations',
      batchId: 'H1B1',
      query: {
        race: '',
      },
    },
    'searchNotarization using nested object => 400': {
      opName: 'findNotarizations',
      batchId: 'H1B1',
      query: {
        nested: {
          something: 'hello',
        },
      },
    },
    'searchNotarization using array => supported for one flat value from the array': {
      opName: 'findNotarizations',
      batchId: 'H1B1',
      query: {
        destinations: '0xED456077E28Fe92a64dd7CC7E91fe2A470Fa03D0',
      },
    },
    'searchNotarization using multiple same key => json parser keeps last key only (object cannot have duplicate keys)':
      {
        opName: 'findNotarizations',
        batchId: 'H1B1',
        query: {
          destinations: '0xED456077E28Fe92a64dd7CC7E91fe2A470Fa03D0',
          destinations: '0x83bD7c3E082D52a730c19A5FF00bFecEC05Eb8F0',
        },
      },
    'searchNotarization using array => unsupported key with array value': {
      opName: 'findNotarizations',
      batchId: 'H1B1',
      query: {
        destinations: ['0xED456077E28Fe92a64dd7CC7E91fe2A470Fa03D0', '0x83bD7c3E082D52a730c19A5FF00bFecEC05Eb8F0'],
      },
    },
    'token with invalid opName': {
      opName: 'something',
      batchId: 'H1B1',
      query: {
        destinations: ['0x83bD7c3E082D52a730c19A5FF00bFecEC05Eb8F0'],
      },
    },
  },
  farmer: {
    // farmer 1
    setupBatch: {
      opName: 'setupBatch',
      batchId: 'F1B1',
      origins: ['H1B1'],
    },
    pushData: {
      opName: 'pushFarmerData',
      batchId: 'F1B1',
      race: 'Hubbard JA-757 ProCare',
      units: 18900,
      farmerHousing: 'NIG-3',
      farmerKipId: '12345-1234-1111',
      farmerSetupDate: 1656547568,
    },
    pushPartialData: {
      opName: 'pushFarmerData',
      batchId: 'F1B1',
      units: 18894,
    },
    orderAnalysis: {
      opName: 'orderAnalysis',
      batchId: 'F1B1',
      orderId: 'Lab001',
      laboratoryEthereumAddress: '0xE0631223F9318a8b11843e3F24Bd40D3d1dc82Df',
    },
    releaseBatch: {
      opName: 'releaseBatch',
      batchId: 'F1B1',
      destinations: [
        '0x3F0fA82D992637359568B0cEc83C4d40673671E7', // SH 1
        '0x56D6dA86935F71969f8f2b5926B7a75Ab7807a86', // SH 2
      ],
    },
    getBatch: {
      opName: 'getBatch',
      batchId: 'F1B1',
    },
    getProductionChain: {
      opName: 'getProductionChain',
      batchId: 'F1B1',
    },
    'searchNotarization using array => supported for one flat value from the array': {
      opName: 'findNotarizations',
      batchId: 'F1B1',
      query: {
        origins: 'H1B1',
      },
    },
  },
  slaughterhouse: {
    // sh 1
    setupBatch: {
      opName: 'setupBatch',
      batchId: 'S1B1',
      origins: ['F1B1'],
    },
    pushData: {
      opName: 'pushSlaughterhouseData',
      batchId: 'S1B1',
      race: 'Hubbard JA-757 ProCare',
      units: 9800,
      slaughterDate: 1668038768,
      farmerHousing: 'NIG-3',
      farmerSetupDate: 1656547568,
    },
    orderAnalysis: {
      opName: 'orderAnalysis',
      batchId: 'S1B1',
      orderId: 'Lab002',
      laboratoryEthereumAddress: '0xE0631223F9318a8b11843e3F24Bd40D3d1dc82Df',
    },
    releaseBatch: {
      opName: 'releaseBatch',
      batchId: 'S1B1',
      destinations: [],
    },
    getBatch: {
      opName: 'getBatch',
      batchId: 'S1B1',
    },
    getProductionChain: {
      opName: 'getProductionChain',
      batchId: 'S1B1',
    },
  },
  laboratory: {
    pushDataForFarmer: {
      opName: 'pushLaboratoryData',
      batchId: 'F1B1',
      orderId: 'Lab001',
      testingDate: 1668038766,
      salmonellaStatus: 'negative',
    },
    pushDataPartialForFarmer: {
      opName: 'pushLaboratoryData',
      batchId: 'F1B1',
      orderId: 'Lab001',
      salmonellaStatus: 'maybe negative',
    },
    pushDataForSlaughterhouse: {
      opName: 'pushLaboratoryData',
      batchId: 'S1B1',
      orderId: 'Lab002',
      testingDate: 1668038768,
      salmonellaStatus: 'positive',
    },
  },
};

const createPayloads = () => {
  const operationUrl = 'POST http://localhost:42008/operation';
  const verifyUrl = 'POST http://localhost:42008/verify-operation';

  Object.keys(payloads).forEach(role => {
    console.log('#############################\n###   ' + role.toUpperCase() + '\n#############################\n\n');
    Object.keys(payloads[role]).forEach(description => {
      const payload = payloads[role][description];
      const privateKey = keys[role];
      const token = ethJws.create({ payload, privateKey });

      const req = operationUrl + '\n' + 'Authorization: Bearer ' + token;
      const vReq =
        payload.opName !== 'getBatch' &&
        payload.opName !== 'getProductionChain' &&
        payload.opName !== 'findNotarizations'
          ? verifyUrl + '\n' + 'Authorization: Bearer ' + token
          : undefined;

      console.log('### ' + role + ' : ' + description + ' :\n' + req + '\n\n\n');
      if (vReq) console.log('### ' + role + ' : VERIFY ' + description + ' :\n' + vReq + '\n\n\n');
    });
  });
};

try {
  createPayloads();
} catch (e) {
  console.error(e);
}
