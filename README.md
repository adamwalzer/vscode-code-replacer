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

`codeReplacer.includeDefaultRules` determines if overriding the rules will include the defaults. If true, defaults will be merged in with configured rules.

`codeReplacer.rules` is the rules for each language.

Default settings

```settings.json
{
    "codeReplacer.replaceOnSave": false,
    "codeReplacer.statusBarText": "`$(telescope) ${codes.length} code segments to replace`",
    "codeReplacer.includeDefaultRules": false,
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

Vimeo Settings should include

```settings.json
{
    "codeReplacer.rules": {
        "scss": {
            "#00adef": "$VimeoBlue",
            "#e5f7fd": "$Foam",
            "#7fc400": "$Pistachio",
            "#f2f9e5": "$RumSwizzle",
            "#ff4d4d": "$SunsetOrange",
            "#ffeded": "$PalePink",
            "#1a2e3b": "$AstroGranite",
            "#8699a6": "$RegentGray",
            "#b3bfc8": "$SoutherlySky",
            "#e3e8e9": "$Porcelain",
            "#eef1f2": "$Plaster",
            "#f6f7f8": "$Paste",
            "#fff": "$White",
            "#0088cc": "$VimeoBlue-Darkened",
            "#5a9e02": "$Pistachio-Darkened",
            "#d93636": "$SunsetOrange-Darkened",
            "#ffb21e": "$WarningYellow",
            "#2E2E2E": "$DarkDark"
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
