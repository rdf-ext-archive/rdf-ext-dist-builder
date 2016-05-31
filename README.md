# rdf-ext-dist-builder

Configurable RDF-Ext distribution builder

## Usage

### Build Distribution

The build script is available with the following options:

* `-o`, `--output <file>`,                        write distribution to this file
* `-l`, `--list`,                                 list available modules
* `-m`, `--modules <comma-separated-modules>`,    included modules.  if argument is omitted, includes all modules by default.
* `-d`, `--debug`,                                add source map to distribution

```bash
# create a distribution bundling all modules
node bin/rdf-ext-dist-builder.js

# list all modules
node bin/rdf-ext-dist-builder.js -l

# create a distribution bundling select modules and a source map
node bin/rdf-ext-dist-builder.js -d -m="rdf-ext,rdf-formats-common"
```

### Import into Browser

Import a pre-built distribution or your custom version with `<script>`:

    <script src="http://rdf-ext.bergnet.org/dist/rdf-ext-all-latest.js"></script>

The distribution imports all selected classes to the global/window context.
For example the N3Parser can be used like this:

    window.N3Parser.parse(turtleString).then(function(graph) {})

or just:

    N3Parser.parse(turtleString).then(function(graph) {})

You can find the property to module name mapping in [this file](https://github.com/rdf-ext/rdf-ext-dist-builder/blob/master/modules.json).
