npm install -g @gltf-transform/cli

gltf-transform uncompress facecap.glb facecap.gltf

gltf-transform inspect facecap.gltf


gltf-pipeline -i facecap.glb -o facecap.gltf --json


gltf-transform cp facecap.gltf facecap_output.gltf


./basisu -ktx2 -decode my_texture.ktx2

ktx-uninstall

toktx

ktx extract image baseColor.ktx2 baseColorOutput.png
