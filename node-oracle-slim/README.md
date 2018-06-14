# node-oracle-slim

a slim initial image with node-8.11.2 / oracle-instantclient-12.2 and only nessesary dependencies, reducing size to only 342MB

# note

due to github's file size limit change to 25MB, I cannot put the `instantclient-basiclite-linux.x64-12.2.0.1.0.zip` in the repository anymore.

Thus, you'll have to download the file at here([instantclient-basiclite-linux.x64-12.2.0.1.0.zip](http://download.oracle.com/otn/linux/instantclient/122010/instantclient-basiclite-linux.x64-12.2.0.1.0.zip)) and put it in the `lib` directory, then build the image by yourself.
