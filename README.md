# code-replacer README

This is a small vscode extension to help replace values with variables in css files.

![Alt text](images/demo.gif?raw=true "Finding Demo Gif")

![Alt text](images/replace-demo.gif?raw=true "Replacement Demo Gif")

## Features

This extension helps us to replace values with variables in css files.

## Requirements

This extension has everything you need.

## Extension Settings

`codeReplacer.replaceOnSave` determines if this extension should auto-replace code on save.

`codeReplacer.statusBarText` determines what's written in the status bar.

`codeReplacer.rules` is the rules for each language.

Default settings

```settings.json
{
    "codeReplacer.replaceOnSave": false,
    "codeReplacer.statusBarText": "`$(telescope) ${codes.length} code segments to replace`",
    "codeReplacer.rules": {
        "js": {
            " var ": " let "
        },
        "scss": {
            "#000": "$black",
            "#FFF": "$white"
        }
    }
}
```

## Known Issues

Known issues are tracked on github. Feel free to post them there or resolve some of the issues you see.

## Release Notes

### See the [CHANGELOG](CHANGELOG.md) for notes on each release.

-----------------------------------------------------------------------------------------------------------

## Thanks

Thank you to [Vimeo](http://vimeo.com/jobs) for giving me the time to work on this extension while at work.

**Enjoy!**
