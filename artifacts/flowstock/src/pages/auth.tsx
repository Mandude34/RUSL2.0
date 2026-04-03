import { SignIn, SignUp } from "@clerk/react";
import { ChefHat } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const appearance = {
  elements: {
    alternativeMethodsBlockButton: 'hidden',
    formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    card: 'shadow-none bg-transparent m-0 p-0',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsBlockButton: 'border-border bg-card hover:bg-accent text-foreground',
    socialButtonsBlockButtonText: 'font-semibold',
    formFieldLabel: 'text-foreground font-medium',
    formFieldInput: 'bg-background border-border text-foreground focus:ring-primary',
    footerActionLink: 'text-primary hover:text-primary/90 font-semibold',
    dividerLine: 'bg-border',
    dividerText: 'text-muted-foreground',
    identityPreviewText: 'text-foreground',
    identityPreviewEditButton: 'text-primary hover:text-primary/90',
  }
};

export function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] bg-background">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 font-bold tracking-tight text-2xl text-primary mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <ChefHat className="h-6 w-6" />
            </div>
            sToK
          </div>
          <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Welcome back to the kitchen command center.
          </p>
          <div className="mt-8">
            <SignIn 
              routing="path" 
              path={`${basePath}/sign-in`} 
              signUpUrl={`${basePath}/sign-up`} 
              appearance={appearance}
            />
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block bg-muted/30 border-l border-border">
        <div className="absolute inset-0 h-full w-full object-cover bg-primary/5 flex items-center justify-center">
          <div className="max-w-xl text-center px-8">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
              <ChefHat className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Master Your Kitchen Inventory</h2>
            <p className="text-lg text-muted-foreground">sToK helps you track ingredients, manage recipes, and optimize your food costs with precision.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] bg-background">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 font-bold tracking-tight text-2xl text-primary mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <ChefHat className="h-6 w-6" />
            </div>
            sToK
          </div>
          <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Start optimizing your food costs today.
          </p>
          <div className="mt-8">
            <SignUp 
              routing="path" 
              path={`${basePath}/sign-up`} 
              signInUrl={`${basePath}/sign-in`}
              appearance={appearance}
            />
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block bg-muted/30 border-l border-border">
        <div className="absolute inset-0 h-full w-full object-cover bg-primary/5 flex items-center justify-center">
          <div className="max-w-xl text-center px-8">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
              <ChefHat className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Join the culinary revolution</h2>
            <p className="text-lg text-muted-foreground">Streamline your operations and focus on what you do best: making great food.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
