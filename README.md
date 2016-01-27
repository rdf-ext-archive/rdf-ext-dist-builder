# rdf-ext-dist-builder

Configurable RDF-Ext distribution builder

## Usage

Import a pre-built distribution or your custom version with `<script>`:

    <script src="http://rdf-ext.bergnet.org/dist/rdf-ext-all-latest.js"></script>
    
The distribution imports all selected classes to the global/window context.
For example the N3Parser can be used like this:

    window.N3Parser.parse(turtleString).then(function(graph) {})

or just:
 
    N3Parser.parse(turtleString).then(function(graph) {})

You can find the property to module name mapping in [this file](https://github.com/rdf-ext/rdf-ext-dist-builder/blob/master/modules.json). 