-- Add ImageUrl1 and ImageUrl2 columns to Vehicles table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='Vehicles' AND column_name='ImageUrl1') THEN
        ALTER TABLE "Vehicles" ADD COLUMN "ImageUrl1" text NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='Vehicles' AND column_name='ImageUrl2') THEN
        ALTER TABLE "Vehicles" ADD COLUMN "ImageUrl2" text NULL;
    END IF;
END $$;
