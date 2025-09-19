import Image from 'next/image';

export function AppFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-center items-center gap-2 text-sm text-muted-foreground py-[10px]">
        <Image 
          src="/assets/images/logo.png" 
          alt="Gatewayz Logo" 
          width={45} 
          height={45} 
          className="object-contain"
        />
        {/* <p>&copy; 2025 GATEWAYZ</p> */}
      </div>
    </footer>
  );
}
