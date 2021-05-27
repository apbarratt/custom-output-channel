import * as vscode from 'vscode';

const defaultChannelName = 'Custom Channel';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('custom-output-channels.addChannel', async () => {
			const channelName = await vscode.window.showInputBox({
				prompt: `Enter a name for this channel (default: ${defaultChannelName}).`,
				title: 'Output channel name',
				placeHolder: 'My Log',
			});

			if (channelName === undefined) {
				vscode.window.showInformationMessage('Cancelled. No output channel created.');
			} else {
				const command = await vscode.window.showInputBox({
					prompt: 'Enter shell command to run as output channel.',
					title: 'Shell command',
					placeHolder: 'tail -f /var/log/MyLogFile.log',
				});
				if(command) {
					createChannel(channelName, command, true);
				} else {
					vscode.window.showInformationMessage('No command provided so no channel created.');
				}
			}
		})
	);
}

function createChannel(channelName: string, command: string, showChannel = false) {
	const channel = vscode.window.createOutputChannel(channelName || defaultChannelName);
	channel.show(showChannel);
	const exec = require('child_process').exec;
	const process = exec(command);
	process.stdout.on('data', (data: string)=>{
			channel.append(data);
	});
	process.stderr.on('data', (data: string)=>{
			channel.append('STDERR: ' + data);
	});
	process.on('close', (code: string) => {
		channel.appendLine(`Process closed with code: ${code}`);
		channel.show(true);
		Promise.resolve(vscode.window.showWarningMessage(
			`Your process in output channel, ${channel.name}, has closed.`, 'Close channel'
		)).finally(() => channel.dispose());
	});
}

export function deactivate() {

}
