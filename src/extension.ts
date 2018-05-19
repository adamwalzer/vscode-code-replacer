// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import {
    commands,
    Diagnostic,
    DiagnosticCollection,
    DiagnosticSeverity,
    Disposable,
    ExtensionContext,
    languages,
    Range,
    StatusBarAlignment,
    StatusBarItem,
    window,
    workspace,
    WorkspaceEdit,
} from 'vscode';

const originalConfiguration = workspace.getConfiguration('codeReplacer');
let {
    rules,
    statusBarText,
    replaceOnSave,
    includeDefaultRules,
} = originalConfiguration;

const getConfig = () => {
    const newConfiguration = workspace.getConfiguration('codeReplacer');
    statusBarText = newConfiguration.statusBarText;
    replaceOnSave = newConfiguration.replaceOnSave;
    includeDefaultRules = newConfiguration.includeDefaultRules;

    if (!includeDefaultRules) {
        const inspectedRules = newConfiguration.inspect('rules');
        const rulesWithoutDefaults = Object.keys(inspectedRules).reduce((a, k) => {
            if (k !== 'key' && k !== 'defaultValue') {
                a = {
                    ...a,
                    ...inspectedRules[k],
                };
            }
            return a;
        }, {});

        rules = Object.keys(rulesWithoutDefaults).length ? rulesWithoutDefaults : newConfiguration.rules;
    } else {
        rules = newConfiguration.rules;
    }

    return {
        statusBarText,
        replaceOnSave,
        includeDefaultRules,
        rules,
    };
};

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {
    // create a new code finder
    let codeFinder = new CodeFinder();
    let controller = new CodeFinderController(codeFinder);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(codeFinder);

    context.subscriptions.push(
        commands.registerCommand('replaceCodes', controller.replaceCodes)
    );
}

class CodeFinder {

    private _statusBarItem: StatusBarItem;

    private _diagnosticCollection: DiagnosticCollection;

    constructor() {
        this._diagnosticCollection = languages.createDiagnosticCollection();
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    }

    public findCodes() {
        if (!this._statusBarItem) return;

        const editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        getConfig();

        const ext = /(?:\.([^.]+))?$/.exec(editor.document.fileName)[1];
        if (!rules.hasOwnProperty(ext)) {
            this._statusBarItem.hide();
            return;
        }

        const config = rules[ext];
        const regExpReplacementPairs = Object.keys(config).map(key => (
            [ new RegExp(key, 'g'), config[key] ]
        ));

        const codes = editor.document.getText().split('\n').reduce((a, line, lineNum) => (
            regExpReplacementPairs.reduce((b, pair) => {
                let match;
                while ((match = pair[0].exec(line)) != null) {
                    b.push(new Diagnostic(
                        new Range(lineNum, match.index, lineNum, match.index + match[0].length),
                        `Replace "${match[0]}" with "${pair[1]}"`,
                        DiagnosticSeverity.Warning
                    ));
                }

                return b;
            }, a)
        ), []);

        if (editor === window.activeTextEditor) {
            this._diagnosticCollection.set(editor.document.uri, codes);
            this._statusBarItem.text = eval(statusBarText);
            this._statusBarItem.show();
        }
    }

    public replaceCodes() {
        if (!this._statusBarItem) return;

        const editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        getConfig();

        const ext = /(?:\.([^.]+))?$/.exec(editor.document.fileName)[1];
        if (!rules.hasOwnProperty(ext)) {
            this._statusBarItem.hide();
            return;
        }

        const config = rules[ext];
        const regExpReplacementPairs = Object.keys(config).map(key => (
            [ new RegExp(key, 'g'), config[key] ]
        ));

        const codes = editor.document.getText().split('\n').forEach((line, lineNum) => {
            regExpReplacementPairs.forEach((pair) => {
                let match;
                while ((match = pair[0].exec(line)) != null) {
                    const edit = new WorkspaceEdit();
                    edit.replace(
                        editor.document.uri,
                        new Range(lineNum, match.index, lineNum, match.index + match[0].length),
                        pair[1]
                    );
                    workspace.applyEdit(edit);
                    editor.document.save();
                }
            });
        });
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class CodeFinderController {

    private _codeFinder: CodeFinder;
    private _disposable: Disposable;

    constructor(codeFinder: CodeFinder) {
        this._codeFinder = codeFinder;

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];

        window.onDidChangeActiveTextEditor(this.findCodes, this, subscriptions);
        workspace.onDidChangeTextDocument(this.findCodes, this, subscriptions);
        workspace.onDidSaveTextDocument(this.findCodes, this, subscriptions);

        getConfig();

        if (replaceOnSave) {
            workspace.onDidSaveTextDocument(this.replaceCodes, this, subscriptions);
        }

        // update the error finder for the current file
        this._codeFinder.findCodes();

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    findCodes = () => {
        this._codeFinder.findCodes();
    }

    replaceCodes = () => {
        this._codeFinder.replaceCodes();
    }

    dispose() {
        this._disposable.dispose();
    }
}
