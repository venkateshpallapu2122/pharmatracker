
import { Button } from "@/components/ui/button";
import { PharmaTrackIcon } from "@/components/icons";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/10 p-4 sm:p-8 text-center">
      <header className="mb-8 sm:mb-12">
        <PharmaTrackIcon className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-primary mb-4" />
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline text-primary mb-2">PharmaTrack</h1>
        <p className="text-lg sm:text-xl text-foreground/80 font-body max-w-md sm:max-w-2xl mx-auto">
          Streamlining pharmaceutical inventory and task management for optimal healthcare efficiency.
        </p>
      </header>

      {/* <main className="mb-8 sm:mb-12 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <Image
          src="https://placehold.co/800x400.png"
          alt="PharmaTrack Dashboard Mockup"
          width={800}
          height={400}
          className="rounded-lg shadow-2xl w-full h-auto"
          data-ai-hint="pharmacy dashboard"
          priority
        />
      </main> */}

      <section className="mb-8 sm:mb-12 max-w-xs sm:max-w-xl md:max-w-3xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-headline text-primary mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg sm:text-xl font-headline text-primary mb-2">Inventory Management</h3>
            <p className="text-sm text-card-foreground/90 font-body">Track stock levels, expiration dates, and manage your entire pharmaceutical inventory with ease.</p>
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg sm:text-xl font-headline text-primary mb-2">Task Coordination</h3>
            <p className="text-sm text-card-foreground/90 font-body">Assign, prioritize, and monitor tasks to ensure timely completion and efficient workflows.</p>
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg sm:text-xl font-headline text-primary mb-2">Analytics & Alerts</h3>
            <p className="text-sm text-card-foreground/90 font-body">Gain insights with visual dashboards and receive critical alerts for expirations and urgent tasks.</p>
          </div>
        </div>
      </section>

      <footer className="mt-6 sm:mt-8">
        <Link href="/dashboard">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-md sm:text-lg px-6 py-4 sm:px-8 sm:py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-out">
            Get Started
          </Button>
        </Link>
        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-foreground/60 font-body">
          &copy; {new Date().getFullYear()} PharmaTrack. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
