import winston from 'winston';

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { timestamp: true });
