- Update name to QuizzTube. This will be the new name of the platform
- When a user is logged in they are not to be shown the log in or register links and only shown an Avatar icon which will take them to their profile page.
- Add Google Material Icon Library
- Move navbar to sidebar with a dark background and fun animations to collapse and expand
- Sidebar nav items to have icons assigned to each item, need to keep the neobrutalism design
- Collapsed sidebar is icons only
- Ajax search for live results when searching. Search is to show 5 options for autocomplete underneath the search term. Also update library results on live search.
- Need to ensure that we only accept YouTube URLs for now
- Add in a cleaner centralized route management system
- Need a strategy in place to ensure that our platform is not taking away from creators and we are trying to give them as much value as possible. How can we have a function to leave a like and a commment for the user? Any other suggestions?

**Prcing**
- Need to install the Stripe skill to set up pricing
- Base the pricing model of the WISPR app that I use (whispr) where we will offer users 7 or 14 days, I don't know which one yet, free trial on Pro so they can have full access to all the Pro features and then offer them the opportunity to sign up to Pro. Not too sure if we offer them a discount at the end of their trial or what we do there. Happy to be guided by research.

**Deployment Strategy**
- Digital Ocean for Hosting
- Supabase for Auth and Database
- Stripe for Payments
- Github for Repo

Need to ensure that we have a clear deployment strategy in place for our workflow. The plan is to continue to work locally whilst pushing updates to the main repo, how will this work? What is the best way forward?

**Home Page**
- Define content for Home Page
- Lots of animation, must be fun. Heavy use of GSAP. Push the boundaries of design for neobrutilism 
- Test section? With 1 question?
- Is it possible to have an animated demo of how the website works?