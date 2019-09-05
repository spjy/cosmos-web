const path = require('path');
const fs = require('fs');
const reactDocgen = require('react-docgen');
const ReactDocGenMarkdownRenderer = require('react-docgen-markdown-renderer');

const componentPath = path.join(__dirname, 'src/components/Dashboard/');
const renderer = new ReactDocGenMarkdownRenderer(/* constructor options object */);

// Clear documentation file for new write
fs.writeFileSync('./components.md', '', 'utf8');

// Retrieve all components
fs.readdir(componentPath, (err, files) => {
  files.forEach((file) => {
    const documentationPath = path.join(componentPath, file);
    if (file.includes('.')) {
      // Extract file contents
      fs.readFile(documentationPath, (error, content) => {
        // Parse it
        const doc = reactDocgen.parse(content);

        const md = renderer.render(
          /* The path to the component, used for linking to the file. */
          path.join(componentPath, file),
          /* The actual react-docgen AST */
          doc,
          /* Array of component ASTs that this component composes*/
          [],
        );

        // Append the parsed documentation, replace status function with String
        fs.appendFileSync('./components.md', md.replace('({ showStatus }, propName, componentName) => {\n  if (showStatus) {\n    return new Error(\n      `${propName} is required when showStatus is true in ${componentName}.`,\n    );\n  }\n\n  return null;\n}', 'String'), 'utf8');
      });
    }
  });
});
