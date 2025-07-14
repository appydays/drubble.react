import React from 'react';
import Modal from './Modal';
import { Trans, useTranslation } from 'react-i18next'; // Import useTranslation
import ShuffleIcon from "./atoms/ShuffleIcon"; // Make sure these are accessible
import ReplaceIcon from "./atoms/ReplaceIcon";

import {FaExchangeAlt, FaRandom} from "react-icons/fa"; // Make sure these are accessible

function SplashHelpModal({ isOpen, onClose }) {
    const { t } = useTranslation(); // Use the t function
    const siteName = process.env.REACT_APP_SITE_NAME;

    return (
        <Modal className="help" isOpen={isOpen} onClose={onClose}>
            <h2>{t('help_modal.title', {siteName: siteName})}</h2>

            <div className="help-content scroll-fade">
                <div className="help-content__wrapper">
                    <div>
                        <div>
                            <span>{t('help_modal.intro_paragraph')}</span><br/>
                            <div className="tile-container daily-letters">
                                {/* These letters can remain static or be translated if they are examples */}
                                <div className="tile "><span className="front">A</span><span className="back">A</span></div>
                                <div className="tile "><span className="front">L</span><span className="back">L</span></div>
                                <div className="tile "><span className="front">W</span><span className="back">W</span></div>
                                <div className="tile "><span className="front">I</span><span className="back">I</span></div>
                                <div className="tile "><span className="front">R</span><span className="back">R</span></div>
                                <div className="tile "><span className="front">O</span><span className="back">O</span></div>
                                <div className="tile "><span className="front">M</span><span className="back">M</span></div>
                                <div className="tile "><span className="front">T</span><span className="back">T</span></div>
                                <div className="tile "><span className="front">P</span><span className="back">P</span></div>
                            </div>
                            <ul>
                                <li>{t('help_modal.list_item_1')}</li>
                                <li>{t('help_modal.list_item_2')}</li>
                                <li>{t('help_modal.list_item_3')}</li>
                                <li>{t('help_modal.list_item_4')}</li>
                                <li>{t('help_modal.list_item_5')}</li>
                            </ul>
                            <ul>
                                {/* Using i18n's Trans component for interpolation */}
                                <li>
                                    <Trans i18nKey="help_modal.shuffle_list_item">
                                        <FaRandom size={24} />
                                    </Trans>
                                </li>
                                <li>
                                    {/* Using dangerouslySetInnerHTML for HTML tags like <br/> and <b> within the string */}
                                    <Trans i18nKey="help_modal.exchange_list_item">
                                        <FaExchangeAlt size={24} />
                                    </Trans>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <p>{t('help_modal.rounds_paragraph_1')}</p>
                        <p>{t('help_modal.rounds_paragraph_2')}</p>
                    </div>

                    <div>
                        <p>{t('help_modal.account_paragraph_1')}</p>
                        <p>{t('help_modal.account_paragraph_2')}</p>
                    </div>
                    <div>{t('help_modal.good_luck_message')}</div>
                    <div><br/><br/></div>
                </div>
            </div>
        </Modal>
    );
}

export default SplashHelpModal;