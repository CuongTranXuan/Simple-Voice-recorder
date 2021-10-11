## Vosk API - Docker/GPU

Docker images with GPU for PCs with NVIDIA cards.

TESTED ENVIRONTMENT: 

    - HARDWARE: 
        - CPU: AMD RYZEN 7 5800H 64bit
        - GPU: NVIDIA RTX 3060 Laptop
        - RAM: 16GB 
        - CUDA version: 11.4 
    - SOFTWARE: 
        - OS: UBUNTU 20.04 LTS
        - Docker CE: 20.10+
        - Docker-compose: v1.28+ 

### Build prerequisites

For PCs make sure you met the following [prerequisites](https://medium.com/geekculture/installing-cudnn-and-cuda-toolkit-on-ubuntu-20-04-for-machine-learning-tasks-f41985fcf9b2).

### Building

Clone sources and check a build file help:

```shell script
git clone https://github.com/sskorol/vosk-api-gpu.git
cd vosk-api-gpu
```

To build images for PC, use the following script:

```shell script
./build-pc.sh -c {CUDA image version} -t {vosk version}
```

Here, you have to provide a base cuda image tag and the ouput container's tag. You can read more by running the script wiht `-h` flag.

This script will build 2 images: base and a sample Vosk server.

To start a newly built container, run the following command:

```shell script
docker-compose up -d
```

Note that you have to download and extract a required [model](https://alphacephei.com/vosk/models) into `./model` folder.
Also make sure you have at least Docker (20.10.6) and Compose (1.29.1) versions.

Your host's CUDA version should match the container's

### Testing

First, install the required dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip3 install pip --upgrade
pip3 install websockets asyncio
```

Now you can perform a quick test for RU model with the following script:

```bash
./test.py weather.wav
```
