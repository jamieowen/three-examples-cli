
# three-examples-cli

## Description
Examples transform using babel traverse for ast manipulation underneath.

## Install

```
npm install three-examples-cli
npx three-examples-cli --postprocessing --loaders[gltf,obj]
```

## Usage

```
import { 
    EffectComposer,
    UnrealBloomPass
    GLTFLoader,
    OBJLoader
} from 'three/ex';
```

### JSON Configuration

## Caveats
This modifies the node_modules three folder directly, which obviously has its draw backs.
So initial 

## 


## Import Usage

For default export paths.


### Direct import.

```
import EffectComposer from 'three/ex/postprocessing/EffectComposer';
```

### Import based on config.



### SubPackage
```        
import { EffectComposer } from 'three/ex/postprocessing'
```