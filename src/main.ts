import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { SSH_KEY } from './constants/constant';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            stopAtFirstError: true,
            whitelist: true,
        }),
    );
    app.setGlobalPrefix('api/v2');

    const config = new DocumentBuilder()
        .setTitle('Osase Documentation')
        .setVersion('2.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
        .build();
    const document = SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
    });
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            apisSorter: 'alpha',
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });

    fs.writeFile(__dirname+'/config/ssh.key', SSH_KEY, function (err) {
        if (err) throw err;
        console.log('SSH Key created');
    });

    await app.listen(process.env.PORT || 8000);
}
bootstrap();
