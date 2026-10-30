
import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class SupabaseStorageService {
    private readonly supabase: SupabaseClient;
    private readonly bucket = 'pmb-documents';

    constructor(private readonly configService: ConfigService) {
        const url = this.configService.get<string>('SUPABASE_URL');
        const secretKey = this.configService.get<string>(
            'SUPABASE_SECRET_KEY',
        );

        if (!url || !secretKey) {
            throw new Error(
                'SUPABASE_URL dan SUPABASE_SECRET_KEY wajib dikonfigurasi',
            );
        }

        this.supabase = createClient(url, secretKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: 'documents' | 'payments',
    ): Promise<string> {
        const extension = extname(file.originalname).toLowerCase();
        const filePath = `${folder}/${randomUUID()}${extension}`;

        const { error } = await this.supabase.storage
            .from(this.bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new InternalServerErrorException(
                `Gagal menyimpan file ke Supabase Storage: ${error.message}`,
            );
        }

        return filePath;
    }
}
