# Aztec Shared State Proof of Concept

This proof-of-concept app demonstrates how users can share state using Aztec’s native Account Abstraction. The smart contract is a Schnorr Account containing logic for a simple expense-tracking app between trusted parties.

The project includes end-to-end tests and a demo frontend built with vanilla React and Webpack.

**Note**: The current contract uses Aztec-nargo version 0.60.0.

## Getting Started

**Prerequisites**
Node.js and Yarn installed
Aztec Sandbox and multiple PXE instances set up (see instructions below)
Installation
Clone the repository:

```bash
git clone [repository_url]
cd [repository_name]
```

### Install dependencies:

```bash
yarn
```

## Compile the project:

```bash
yarn compile
```

### Setting Up the Aztec Sandbox and PXEs

This demo uses three PXEs to showcase shared account state by registering it in each user's PXE. You can add more PXE instances and accounts as needed.

Download and set up the Aztec Sandbox:

Refer to the Aztec Getting Started Guide for instructions.

4. **Installing the Aztec Sandbox** .

```bash

    bash -i <(curl -s https://install.aztec.network)

```

## Run multiple PXE instances:

Follow the Aztec Guide on Running Multiple PXEs. For more information visit,
https://docs.aztec.network/guides/developer_guides/local_env/run_more_than_one_pxe_sandbox

For the First PXE

```bash
cd ~/.aztec && docker-compose -f ./docker-compose.sandbox.yml up
```

For the second PXE

```bash
aztec start --port 8081 --pxe nodeUrl=http://host.docker.internal:8080/
```

For the third PXE

```bash
aztec start --port 8082 --pxe nodeUrl=http://host.docker.internal:8080/
```

## Generate Artifact

```bash
yarn codegen
```

Note: Due to an issue with artifact generation, cast the type of AccountGroupContractArtifactJson as unknown in the generated AccountGroup.ts artifact.

## Running Tests

Execute end-to-end tests:

```bash
yarn test
```

## Running the Demo Frontend

Start the demo frontend locally:

```bash
yarn dev
```

# About This Proof of Concept

Native Account Abstraction in Aztec enables shared private state between users, paving the way for more elaborate schemes to share private secrets and states.

Every account in Aztec is a smart contract, typically used for signature, fee, and nonce abstraction. This concept extends to private contracts:

“Since the entrypoint interface of an account is not enshrined, there is nothing that differentiates an account contract from an application one in the protocol. This allows implementing functions that do not need to be called by any particular user and are just intended to advance the state of a contract.”

By registering the account contract—similar to a normal account contract—in your PXE, any PXE with the registered smart contract can privately access and alter the contract's state among trusted users.

This proof of concept can be enhanced for more unique use cases in the future.
