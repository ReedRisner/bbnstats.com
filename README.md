# BBN Stats

Static Kentucky basketball stats site for [bbnstats.com](https://bbnstats.com), built with plain HTML, CSS, and JavaScript and deployed on GitHub Pages.

## GitHub Pages Deployment

1. Create a GitHub repository named `bbnstats.com` or another repo name if you prefer.
2. Push this project to the `main` branch.
3. In GitHub, open `Settings` -> `Pages`.
4. Set the source to `Deploy from branch`.
5. Select branch `main` and folder `/ (root)`.
6. Keep the root [CNAME](C:/Users/reedl/OneDrive/Documents/bbnstats.com/CNAME) file with:

```txt
bbnstats.com
```

## DNS Setup

At your domain registrar or DNS provider for `bbnstats.com`, add these records:

`A` records pointing to GitHub Pages:

```txt
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

`CNAME` record:

```txt
www -> {your-github-username}.github.io
```

## Final GitHub Pages Step

1. Go back to `Settings` -> `Pages`.
2. Enable `Enforce HTTPS`.
3. After DNS propagation, the site should be live at [https://bbnstats.com](https://bbnstats.com), which can take up to 24 hours.

## Notes

- No build step is needed.
- All files are static HTML, CSS, and JavaScript.
- Just push changes to `main` and GitHub Pages will serve the site.
