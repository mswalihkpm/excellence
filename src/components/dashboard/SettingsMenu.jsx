
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, Moon, Sun, LockKeyhole, Info, Mail, Phone, Facebook, Twitter, Instagram, MessageCircle as WhatsappIcon, BookOpen } from 'lucide-react';

const SettingsMenu = ({ onLogout, toggleTheme, currentTheme, onShowChangePassword }) => {
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const appDescription = "Excellence is a comprehensive educational management platform designed to streamline academic and administrative tasks for students, masters, and MHS staff. It offers a suite of tools including student information management, level tracking, event scheduling, and financial record keeping. With dedicated modules for library services, spiritual activity tracking, and communication features like Postogram and ChatGroups, Excellence aims to foster a connected and efficient learning environment. The platform emphasizes ease of use with a modern, intuitive interface, customizable themes, and multilingual support. Excellence is your all-in-one companion for academic organization, communication, and progress monitoring, empowering every user to achieve their best. It is built with cutting-edge web technologies to ensure a seamless and responsive experience across devices. Join us in redefining educational management with Excellence.";
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <motion.div whileHover={{ rotate: 20 }} whileTap={{ scale: 0.9 }}>
              <Settings className="h-6 w-6 text-primary" />
            </motion.div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background/90 backdrop-blur-md shadow-xl border-border">
          <DropdownMenuLabel className="font-semibold text-primary">Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onShowChangePassword} className="cursor-pointer group">
            <LockKeyhole className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <span>Change Password</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer group">
            {currentTheme === 'dark' ? <Sun className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" /> : <Moon className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />}
            <span>Toggle Mode</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem onClick={() => setShowAboutDialog(true)} className="cursor-pointer group">
            <Info className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <span>About Excellence</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowContactDialog(true)} className="cursor-pointer group">
            <Mail className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <span>Contact Us</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-500 hover:!bg-red-500/10 hover:!text-red-600 group">
            <LogOut className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="sm:max-w-md bg-card/90 dark:bg-card/85 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">About Excellence</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2 max-h-[60vh] overflow-y-auto">
              {appDescription}
              <p className="mt-4">
                This app is run by <a href="https://madin.edu.in/institute/madin-school-of-excellence/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Ma’din School of Excellence</a>.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowAboutDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md bg-card/90 dark:bg-card/85 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Contact Us</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              For support or inquiries, please reach out to us:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <a href="mailto:excellence@madin.edu.in" className="text-foreground hover:underline hover:text-primary break-all">
                excellence@madin.edu.in
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <span className="text-foreground">04834355216</span>
            </div>
            <div className="flex items-center space-x-3">
              <Facebook className="h-5 w-5 text-primary shrink-0" />
              <a href="https://facebook.com/MSOExcellence" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline hover:text-primary break-all">
                facebook.com/MSOExcellence
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Twitter className="h-5 w-5 text-primary shrink-0" />
              <a href="https://twitter.com/MSOEXCELLENCE" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline hover:text-primary break-all">
                twitter.com/MSOEXCELLENCE
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Instagram className="h-5 w-5 text-primary shrink-0" />
              <a href="https://instagram.com/msoexcellence/?hl=en" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline hover:text-primary break-all">
                instagram.com/msoexcellence
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowContactDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsMenu;
