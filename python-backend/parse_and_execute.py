import sys
import re
import os

a = """
To achieve this, we'll need to create an HTML file with a basic structure, a JavaScript file to handle the button click and counter logic, and a CSS file for styling.

\createfile[[index.html]][[<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
    <title>Counter Button</title>
</head>
<body>
    <button id="counterButton">0</button>
</body>
</html>]]

\createfile[[styles.css]][[body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    font-family: Arial, sans-serif;
}

button {
    font-size: 24px;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    background-color: #4CAF50;
    color: white;
}]]

\createfile[[script.js]][[document.addEventListener('DOMContentLoaded', () => {
    const counterButton = document.getElementById('counterButton');
    let count = parseInt(localStorage.getItem('counter')) || 0;
    counterButton.textContent = count;

    counterButton.addEventListener('click', () => {
        count++;
        counterButton.textContent = count;
        localStorage.setItem('counter', count);
    });
});]]

Here are the files created for your website:

1. index.html: The main HTML structure containing the button element.
2. styles.css: The CSS file for styling the button and centering it on the page.
3. script.js: The JavaScript file that handles the counter logic, reads/writes to local storage, and updates the button text.

\summary[[I created an index.html file with a button in the middle, a styles.css file for styling, and a script.js file for the counter logic and handling cookies.]]

"""

b = '''
To add a second page with a prime number as the title and navigation between the two pages, I will create a new HTML file called prime.html and update the index.html file to include a link to the second page. I will also add a link to the second page for navigating back to the first page.

\createfile[[prime.html]][[<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Prime Number: 2</title>
</head>
<body>
    <h1>Prime Number: 2</h1>
    <a href="index.html">Go back to Counter Button</a>
</body>
</html>]]

Next, I'll update the index.html file to include a link to the prime.html file:

\createfile[[index.html]][[<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
    <title>Counter Button</title>
</head>
<body>
    <button id="counterButton">0</button>
    <a href="prime.html">Go to Prime Number Page</a>
</body>
</html>]]

Now you have two pages with navigation between them:

1. index.html: The main page with the counter button and a link to the prime.html page.
2. prime.html: The second page displaying a prime number as the title and a link to go back to the index.html page.

\summary[[I added a second page (prime.html) with a prime number as the title and updated the index.html file to include navigation links between the two pages.]]
'''


## command and control functianlity for the bot
def parse_and_execute_command(command):
    createfile_pattern = r'\\createfile\[\[(.+?)\]\]\[\[(.+?)\]\]'
    createdir_pattern = r'\\createdir\[\[(.+?)\]\]'
    summmary_pattern = r'\\summary\[\[(.+?)\]\]'


    createfile_list = re.findall(createfile_pattern, command, re.DOTALL)
    createdir_list = re.findall(createdir_pattern, command, re.DOTALL)
    summary_list = re.findall(summmary_pattern, command, re.DOTALL)


    for filename, content in createfile_list:
        createfile(filename, content)

    for dirname in createdir_list:
        createdir(dirname)

    for summary in summary_list:
        print(summary)
    
    if len(summary_list) == 0:
        print('Ok. Done.')


basedir = os.path.join( '/usr', 'src', 'app', 'session', 'project')
    
def createfile(filename, content):
    filename = os.path.join(basedir, filename)
    with open(filename, "w") as file:
        file.write(content)
    #print(f"File '{filename}' created with content:\n{content}")

def createdir(directoryname):
    os.makedirs(directoryname, exist_ok=True)
    #print(f"Directory '{directoryname}' created.")


if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]
        test = ''.join(sys.argv)
        command = b if 'second' in test else a
        #print('parsing command ' + command)
        parse_and_execute_command(command)
    else:
        parse_and_execute_command(a)


