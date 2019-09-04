/**
 * @author https://www.branislav.xyz
 */

import * as fs from 'fs';

export enum ConsoleColors {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',

  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',

  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
}

export class Logger {
  public component: string;
  public static filePath?: string;
  constructor(component: string) {
    this.component = component;
  }
  public info(place: string, message: any): void {
    let print: string = '';
    if (typeof message === 'object') {
      print = `\r\n${ConsoleColors.FgWhite}${JSON.stringify(message, null, 2)}${
        ConsoleColors.Reset
      }`;
    } else {
      print = message;
    }
    const output: string[] = [
      `${ConsoleColors.BgWhite}${ConsoleColors.FgBlack}[INFO]${
        ConsoleColors.Reset
      }`,
      `[${ConsoleColors.FgCyan}${new Date().toLocaleString()}${
        ConsoleColors.Reset
      }]`,
      `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.component}${
        ConsoleColors.Reset
      }`,
      `${ConsoleColors.FgMagenta}${place}${ConsoleColors.Reset}`,
      '>',
      print,
    ];
    this.output(output);
  }
  public warn(place: string, message: any): void {
    let print: string = '';
    if (typeof message === 'object') {
      print = `\r\n${ConsoleColors.FgYellow}${JSON.stringify(
        message,
        null,
        2,
      )}${ConsoleColors.Reset}`;
    } else {
      print = message;
    }
    const output: string[] = [
      `${ConsoleColors.BgYellow}${ConsoleColors.FgBlack}[WARN]${
        ConsoleColors.Reset
      }`,
      `[${ConsoleColors.FgCyan}${new Date().toLocaleString()}${
        ConsoleColors.Reset
      }]`,
      `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.component}${
        ConsoleColors.Reset
      }`,
      `${ConsoleColors.FgMagenta}${place}${ConsoleColors.Reset}`,
      '>',
      print,
    ];
    this.output(output);
  }
  public error(place: string, message: any): void {
    let print: string = '';
    if (typeof message === 'object') {
      let stack: string | undefined;
      if (message.stack) {
        stack = message.stack;
        delete message.stack;
      }
      print = `\r\n${ConsoleColors.FgRed}${JSON.stringify(message, null, 2)}${
        ConsoleColors.Reset
      }`;
      if (stack) {
        print =
          print + `\r\n${ConsoleColors.FgRed}${stack}${ConsoleColors.Reset}`;
      }
    } else {
      print = message;
    }
    const output: string[] = [
      `${ConsoleColors.BgRed}${ConsoleColors.FgBlack}[ERROR]${
        ConsoleColors.Reset
      }`,
      `[${ConsoleColors.FgCyan}${new Date().toLocaleString()}${
        ConsoleColors.Reset
      }]`,
      `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.component}${
        ConsoleColors.Reset
      }`,
      `${ConsoleColors.FgMagenta}${place}${ConsoleColors.Reset}`,
      '>',
      print,
    ];
    this.output(output);
  }

  private output(s: string[]) {
    // tslint:disable-next-line: no-console
    console.log(s.join(' '));
    s = [...s, '\r\n'];
    if (Logger.filePath) {
      fs.appendFile(Logger.filePath, s.join(' '), error => {
        if (error) {
          // tslint:disable-next-line: no-console
          console.error(error);
        }
      });
    }
  }
}
