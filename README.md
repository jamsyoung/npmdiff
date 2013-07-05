# npmdiff
Command line tool to diff npm packages to one another or to local file system
folders.

**IMPORTANT** - This is not a working package yet.


## Install
It is recommended to install this globally so it is available everywhere in
your development environment.

    $ npm i -g npmdiff


## Usage Examples

    $ npm test-package@0.0.1 test-package@0.0.2
    $ npm local-test-directory test-package@0.0.2


## Commentary on Implementation
This is a command line tool. In my opinion that makes using synchronous calls
OK.  [Conversation is enrouraged on this as an Issue on this repository][0], as
there seems to be no consensus on when synchronous calls should and should not
be used in node based applications.




[0]: https://github.com/jamsyoung/npmdiff/issues/1
