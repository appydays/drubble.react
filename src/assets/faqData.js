import React from 'react';

const getFaqData = (t) => {

    return [
        {
            id: 'whyDrubble',
            title: 'Why Drubble?',
            content: (
                <>
                    <p>This game was originally developed as Wordscram, but unfortunately it was found that another game was already out there with that name! So we thought hard and long on various names related to words and puzzles, but they've pretty much all been thought of before.</p>
                    <p>So why <b>Drubble?</b></p>
                    <p>
                        Etymology of "Drub":
                        The ultimate origin of "drub" is uncertain, but the most commonly cited theory is that it comes from the Arabic word "ḍaraba" (ضرب), meaning "to beat" or "to strike."
                        It's believed to have entered the English language in the 17th century, possibly brought back by travelers who observed a form of punishment in Asia involving beating the soles of a person's feet with a stick or cudgel. This original sense of a severe physical beating is central to its early usage.
                        Use of "Drub" and "Drubbing":
                        Over the centuries, the meaning of "drub" has broadened and become more figurative, though it still retains its core sense of forceful impact or overwhelming defeat.
                    </p>
                    <p>
                        "Drubbing" is the verbal noun form of "drub," and it refers to:
                        A severe beating (literal or figurative) or a sound defeat.
                    </p>
                    <p>so hence we came up with drubble, so why not give your family and friends a right drubbing - Let's Drubble! </p>
                </>
            ),
            languages: ['en','gb'],
        },
        {
            id: 'howToPlay',
            title: t('faqs.how_to_play.title'),
            content: (
                <>
                    <div dangerouslySetInnerHTML={{ __html: t('faqs.how_to_play.content_p1') }}></div>
                    <br/>
                    <div dangerouslySetInnerHTML={{ __html: t('faqs.how_to_play.content_p2',{ sitename : process.env.REACT_APP_SITE_NAME}) }}></div>
                </>
            ),
            languages: ['en','gb', 'cy', 'nl', 'es', 'it']
        },
        {
            id: 'miniLeagues',
            title: t('faqs.mini-leagues.title'),
            content: (
                <>
                    <div dangerouslySetInnerHTML={{ __html: t('faqs.mini-leagues.content_p1') }}></div>
                    <br/>
                    <div dangerouslySetInnerHTML={{ __html: t('faqs.mini-leagues.content_p2') }}></div>
                </>
            ),
            languages: ['en','gb', 'cy', 'nl', 'es', 'it']
        },
        {
            id: 'whyRegister',
            title: t('faqs.why_register.title'),
            content: (
                <div className="section-content expanded">
                    <div dangerouslySetInnerHTML={{__html: t('faqs.why_register.content_p1')}}></div>
                    <br/>
                    <div
                        dangerouslySetInnerHTML={{__html: t('faqs.why_register.content_p2', {sitename: process.env.REACT_APP_SITE_NAME})}}></div>
                </div>
            ),
            languages: ['en','gb', 'cy', 'nl', 'es', 'it'],
        },
        {
            id: 'futurePlan',
            title: t('faqs.future_plans.title'),
            content: (
                <div className="section-content expanded">
                    <p>{t('faqs.future_plans.content_p1')}</p>
                    <ol>
                        <li>{t('faqs.future_plans.list_item_1')}</li>
                        <li>{t('faqs.future_plans.list_item_2')}</li>
                        <li>{t('faqs.future_plans.list_item_3')}</li>
                        <li>{t('faqs.future_plans.list_item_4')}</li>
                        <li>{t('faqs.future_plans.list_item_5')}</li>
                    </ol>
                    <p>{t('faqs.future_plans.contact_message', {supportEmail: process.env.REACT_APP_SUPPORT_EMAIL})}</p>
                    <p>{t('faqs.future_plans.newsletter_message', {sitename: process.env.REACT_APP_SITE_NAME})}</p>
                </div>
            ),
            languages: ['en','gb', 'cy', 'nl', 'es', 'it'],
        }
    ];
};

export default getFaqData;