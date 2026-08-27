
//first_charge
let first_charge = true;
(!localStorage.getItem('first_charge')) ? localStorage.setItem('first_charge', 1) : first_charge = false ;

const HATHOR_LOGO_WORDMARK = "Hathor";
const isHathorEmbed = window.parent !== window;

function hideLoaderUi() {
    document.querySelectorAll('.loader__progress, .loader__percent, .header__progress, .header__percent').forEach((node) => {
        node.style.display = 'none';
        node.style.visibility = 'hidden';
        node.style.opacity = '0';
    });
}

function patchHathorLogoWordmark() {
    document.querySelectorAll('.logo__boring').forEach((el) => {
        const reg = el.querySelector('.reg');
        while (el.firstChild) el.removeChild(el.firstChild);
        el.appendChild(document.createTextNode(HATHOR_LOGO_WORDMARK));
        if (reg) el.appendChild(reg);
    });
}

function startEmbeddedInit() {
    hideLoaderUi();
    try {
        gsap.set('body', { opacity: 1 });
        gsap.set('main', { opacity: 1 });
    } catch (err) {}

    patchHathorLogoWordmark();

    const kick = () => {
        if (typeof init !== 'function') {
            window.setTimeout(kick, 50);
            return;
        }
        init();
    };

    window.setTimeout(kick, 50);
}

document.addEventListener('DOMContentLoaded', () => {
    hideLoaderUi();

    if (isHathorEmbed) {
        startEmbeddedInit();
        return;
    }

    try {
        gsap.set('body',{opacity:1});
        gsap.set('main',{opacity:1});
    } catch (err) {}

    ///ANIM PRECHARGE
    ///ANIM PRECHARGE
    ///ANIM PRECHARGE
    let loaderAnim_end = false;

    try {
    patchHathorLogoWordmark();

    //anima logo
    const split_normal = header_logo_normal ? SplitText.create(header_logo_normal, {type: "chars,lines", charsClass: "char"}) : null
    const split_is = document.querySelector('.header .logo__is') ? SplitText.create('.header .logo__is', {type: "chars",charsClass: "char"}) : null
    const split_boring = document.querySelector('.header .logo__boring') ? SplitText.create('.header .logo__boring', {type: "chars",charsClass: "char"}) : null
    const split_intro_boring = document.querySelector('.mod-scroll__intro__logo .logo__boring')
        ? SplitText.create('.mod-scroll__intro__logo .logo__boring', {type: "chars", charsClass: "char"})
        : null;
    header_logo?.querySelectorAll('.char').forEach(elem => {
        const content = elem.innerHTML;
        elem.innerHTML = '<span>'+content+'</span>';
    })
    document.querySelectorAll('.mod-scroll__intro__logo .logo__boring .char').forEach(elem => {
        const content = elem.innerHTML;
        elem.innerHTML = '<span>'+content+'</span>';
    })
    } catch (err) {
        console.warn('preloader split', err);
    }
    const logo_tl = gsap.timeline({paused:true,onComplete:()=>{
        loaderAnim_end = true;
        if(control) console.log('loaderAnim_end: ',loaderAnim_end);
        if(fake_progress==100 && loaderAnim_end) loadComplete();
    }})
    logo_tl.from('.header .logo__normal span, .header .logo__is span, .header .logo__boring span',{x:'120%', duration: .5, stagger: 0.1, ease: 'power3.out'},0)
    // logo_tl.from(elem.querySelectorAll('.logo__boring span'),{x:'-120%', duration: .5, stagger: 0.1, ease: 'power3.out'}
          
    //if isset mods change color preloader
    if(document.querySelector('.mod-scroll__intro.bg-black') || document.querySelector('.mod-header--proyecto')){
        smoothWrapper.classList.add('bg-black')
    }
    //PRECHARGE
    //PRECHARGE
    //PRECHARGE
    let img = document.images, completed = 0, porcentLoad = 0, 
        totalImg = img.length, setFakeNumber = '', fake_progress = 0;
    // const loader = document.querySelector('.loader');
    const progress_bar = document.querySelector('.loader__progress');
    const progress_number = document.querySelector('.loader__percent');

    //if no isset images loadComplete()
    // if(totalImg == 0) return loadComplete();

    //on image is laoded
    const imgLoaded = () => {
        completed += 1;
        porcentLoad = ((100/totalImg*completed) << 0);
        // console.log('porcentLoad',porcentLoad);
    }

    ///loading all images
    for(var i=0; i<totalImg; i++) {
        var tImg     = new Image();
        tImg.onload  = imgLoaded;
        tImg.onerror = imgLoaded;
        tImg.src     = img[i].src;
    }

    ///set fake number
    setFakeNumber = setInterval(() => {

        if(first_charge){
            ///primera carga
            gsap.set('body',{opacity:1})
            if(logo_tl.progress()==0) setTimeout(() => { logo_tl.timeScale(timescale).play() }, 500);
            
            fake_progress++
            if(fake_progress > porcentLoad) fake_progress = porcentLoad;
            if(fake_progress > 100) fake_progress = 100;

            if (progress_bar) progress_bar.style = '--progress:'+fake_progress+'%'+'';
            const progress_width = progress_bar ? progress_bar.getBoundingClientRect().width : 0;
            const porcentLoadent = Math.trunc(( progress_width * 100) / window.innerWidth) + '%';
            if(progress_number && porcentLoadent!='1%') progress_number.innerHTML = porcentLoadent;

            ///complete
            if(fake_progress==100 && setFakeNumber && loaderAnim_end) loadComplete(); 

        }else{
            ///cargas posteriores
            if(porcentLoad== 100) loadComplete();
        }

    }, 50);

    window.setTimeout(() => {
        if (fake_progress < 100) fake_progress = 100;
        if (porcentLoad < 100) porcentLoad = 100;
        loaderAnim_end = true;
        loadComplete();
    }, 4000);

    let loadCompleteOnce = false;
    const loadComplete = () => {
        if (loadCompleteOnce) return;
        loadCompleteOnce = true;

        if(control) console.log('loadComplete');
        

        if(setFakeNumber!='') clearInterval(setFakeNumber) 
        if(first_charge){
            const porcentLoadent = '100%';
            if (progress_number) progress_number.innerHTML = porcentLoadent;
            if (progress_bar) gsap.to(progress_bar,{ opacity:0, duration: .5,  ease: 'linear' })
            if (progress_number) gsap.to(progress_number,{opacity:0, duration: .33, ease: 'linear'},'<')
            ///init
            setTimeout(() => {
                init()
            }, 1500);
        }else{
            gsap.set('body',{opacity:1})
            setTimeout(() => { logo_tl.progress(0).timeScale(timescale).play() }, 500);
            hideLoaderUi();
            ///init
            setTimeout(() => {
                logo_tl.progress(1)
                init()
            }, 3000/timescale);
        }
        
        
    }

        
    
})


