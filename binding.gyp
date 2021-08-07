{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "src/binding.cc"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<(module_root_dir)/interception/include",
      ],
      "libraries": [
        "<(module_root_dir)/interception/x64/interception.lib",
      ],
      "copies": [
        {
          "destination": "<(module_root_dir)/build/Release/",
          "files": [
            "<(module_root_dir)/interception/x64/interception.dll",
          ],
        }
      ],
      "conditions": [
        ["OS==\"win\"", {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          }
        }]
      ]
    }
  ]
}
