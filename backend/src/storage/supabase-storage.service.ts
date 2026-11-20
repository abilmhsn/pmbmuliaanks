
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
    private readonly newsBucket = 'news-images';
    private newsBucketChecked = false;

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

    private async ensureNewsBucket(): Promise<void> {
        if (this.newsBucketChecked) return;
        try {
            const { data: buckets } = await this.supabase.storage.listBuckets();
            const exists = buckets?.some((b) => b.name === this.newsBucket);
            if (!exists) {
                await this.supabase.storage.createBucket(this.newsBucket, {
                    public: true,
                    fileSizeLimit: 10 * 1024 * 1024,
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                });
            }
            this.newsBucketChecked = true;
        } catch (err) {
            console.warn('Gagal memeriksa/membuat bucket news-images:', err);
        }
    }

    async uploadNewsImage(file: Express.Multer.File): Promise<string> {
        await this.ensureNewsBucket();
        const extension = extname(file.originalname).toLowerCase();
        const filePath = `covers/${Date.now()}-${randomUUID()}${extension}`;

        const { error } = await this.supabase.storage
            .from(this.newsBucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new InternalServerErrorException(
                `Gagal menyimpan gambar berita ke Supabase Storage: ${error.message}`,
            );
        }

        const { data } = this.supabase.storage
            .from(this.newsBucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    async deleteNewsImage(imageUrlOrPath?: string): Promise<void> {
        if (!imageUrlOrPath || imageUrlOrPath.trim() === '') return;
        try {
            let relativePath = imageUrlOrPath;
            if (imageUrlOrPath.includes(`/${this.newsBucket}/`)) {
                relativePath = imageUrlOrPath.split(`/${this.newsBucket}/`)[1];
            } else if (imageUrlOrPath.startsWith('http')) {
                const url = new URL(imageUrlOrPath);
                const segments = url.pathname.split(`/${this.newsBucket}/`);
                if (segments.length > 1) {
                    relativePath = segments[1];
                }
            }

            // Hapus query params jika ada
            relativePath = relativePath.split('?')[0];

            await this.supabase.storage.from(this.newsBucket).remove([relativePath]);
        } catch (err) {
            console.warn('Gagal menghapus gambar berita dari storage:', err);
        }
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
