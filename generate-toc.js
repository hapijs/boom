'use strict';

// Load modules

const Toc = require('markdown-toc');
const Fs = require('fs');

// Declare internals

const internals = {
    filename: './README.md'
};


internals.generate = function () {

    const api = Fs.readFileSync(internals.filename, 'utf8');
    const tocOptions = {
        bullets: '-',
        slugify: function (text) {

            return text.toLowerCase()
                .replace(/\s/g, '-')
                .replace(/[^\w-]/g, '');
        }
    };

    const output = Toc.insert(api, tocOptions);
    Fs.writeFileSync(internals.filename, output);
};

internals.generate();
